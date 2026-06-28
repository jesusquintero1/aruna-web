-- ============================================================
-- ARÜNA · Migración: edición/eliminación de pedidos + precios POS
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- 1) DESCUENTO en pedidos
--    El POS puede vender más caro (override de precio por línea)
--    o aplicar un descuento global al total.
--      subtotal = Σ (precio_unitario × cantidad)   (precio override o de la DB)
--      total    = max(0, subtotal − descuento)
-- ------------------------------------------------------------
alter table orders add column if not exists descuento int not null default 0;

-- ============================================================
-- 2) create_order  (REEMPLAZO)
--    Cambios vs. versión anterior:
--      · cada ítem admite "precio_unitario" opcional (override del POS);
--        si no viene o es <= 0 se usa el precio actual del producto.
--      · nuevo parámetro p_descuento (descuento global sobre el subtotal).
--    Se elimina la firma vieja (13 args) para no dejar overloads colgando.
-- ============================================================
drop function if exists create_order(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
);

create or replace function create_order(
  p_id text,
  p_channel text,
  p_estado text,
  p_metodo_pago text,
  p_cliente_nombre text,
  p_cliente_telefono text,
  p_cliente_email text,
  p_cliente_cedula text,
  p_cliente_ciudad text,
  p_cliente_departamento text,
  p_cliente_direccion text,
  p_notas text,
  p_items jsonb,
  p_descuento int default 0
) returns text
language plpgsql
as $$
declare
  v_item jsonb;
  v_pid text;
  v_qty int;
  v_override int;
  v_precio int;
  v_prod products%rowtype;
  v_subtotal int := 0;
  v_desc int := greatest(0, coalesce(p_descuento, 0));
  v_total int;
  v_line int;
begin
  -- Validar y bloquear filas de producto
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);
    v_override := coalesce((v_item->>'precio_unitario')::int, 0);

    select * into v_prod from products where id = v_pid for update;
    if not found then
      raise exception 'PRODUCTO_NO_EXISTE:%', v_pid;
    end if;
    if v_prod.stock < v_qty then
      raise exception 'SIN_STOCK:%', v_prod.nombre;
    end if;

    v_precio := case when v_override > 0 then v_override else v_prod.precio end;
    v_subtotal := v_subtotal + (v_precio * v_qty);
  end loop;

  v_total := greatest(0, v_subtotal - v_desc);

  -- Insertar el pedido
  insert into orders (
    id, channel, estado, metodo_pago, subtotal, total, descuento,
    cliente_nombre, cliente_telefono, cliente_email, cliente_cedula,
    cliente_ciudad, cliente_departamento, cliente_direccion, notas
  ) values (
    p_id, p_channel, p_estado, p_metodo_pago, v_subtotal, v_total, v_desc,
    p_cliente_nombre, p_cliente_telefono, p_cliente_email, p_cliente_cedula,
    p_cliente_ciudad, p_cliente_departamento, p_cliente_direccion, p_notas
  );

  -- Insertar ítems + descontar stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);
    v_override := coalesce((v_item->>'precio_unitario')::int, 0);
    select * into v_prod from products where id = v_pid;
    v_precio := case when v_override > 0 then v_override else v_prod.precio end;
    v_line := v_precio * v_qty;

    insert into order_items (order_id, product_id, nombre_snapshot, precio_snapshot, cantidad, subtotal)
    values (p_id, v_pid, v_prod.nombre, v_precio, v_qty, v_line);

    update products set stock = stock - v_qty where id = v_pid;
  end loop;

  return p_id;
end;
$$;

-- ============================================================
-- 3) delete_order  (NUEVO)
--    Devuelve el stock de cada ítem al inventario y elimina el
--    pedido (order_items se borra por cascada). Todo transaccional.
-- ============================================================
create or replace function delete_order(p_id text) returns void
language plpgsql
as $$
declare
  v_it record;
begin
  for v_it in select product_id, cantidad from order_items where order_id = p_id
  loop
    if v_it.product_id is not null then
      update products set stock = stock + v_it.cantidad where id = v_it.product_id;
    end if;
  end loop;

  delete from orders where id = p_id;  -- cascada borra order_items
end;
$$;

-- ============================================================
-- 4) update_order  (NUEVO)
--    Edición completa de un pedido (incluye ítems):
--      1) repone al stock las cantidades del pedido actual,
--      2) borra los ítems actuales,
--      3) valida y reaplica los nuevos ítems (con override de precio),
--      4) actualiza cabecera, subtotal/total/descuento.
-- ============================================================
create or replace function update_order(
  p_id text,
  p_estado text,
  p_metodo_pago text,
  p_cliente_nombre text,
  p_cliente_telefono text,
  p_cliente_email text,
  p_cliente_cedula text,
  p_cliente_ciudad text,
  p_cliente_departamento text,
  p_cliente_direccion text,
  p_notas text,
  p_items jsonb,
  p_descuento int default 0
) returns text
language plpgsql
as $$
declare
  v_it record;
  v_item jsonb;
  v_pid text;
  v_qty int;
  v_override int;
  v_precio int;
  v_prod products%rowtype;
  v_subtotal int := 0;
  v_desc int := greatest(0, coalesce(p_descuento, 0));
  v_total int;
  v_line int;
begin
  if not exists (select 1 from orders where id = p_id) then
    raise exception 'PEDIDO_NO_EXISTE:%', p_id;
  end if;

  -- 1) Reponer stock de los ítems actuales
  for v_it in select product_id, cantidad from order_items where order_id = p_id
  loop
    if v_it.product_id is not null then
      update products set stock = stock + v_it.cantidad where id = v_it.product_id;
    end if;
  end loop;

  -- 2) Borrar ítems actuales
  delete from order_items where order_id = p_id;

  -- 3) Validar nuevos ítems (con stock ya repuesto) y bloquear filas
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);
    v_override := coalesce((v_item->>'precio_unitario')::int, 0);

    select * into v_prod from products where id = v_pid for update;
    if not found then
      raise exception 'PRODUCTO_NO_EXISTE:%', v_pid;
    end if;
    if v_prod.stock < v_qty then
      raise exception 'SIN_STOCK:%', v_prod.nombre;
    end if;

    v_precio := case when v_override > 0 then v_override else v_prod.precio end;
    v_subtotal := v_subtotal + (v_precio * v_qty);
  end loop;

  v_total := greatest(0, v_subtotal - v_desc);

  -- 4) Actualizar cabecera
  update orders set
    estado = p_estado,
    metodo_pago = p_metodo_pago,
    subtotal = v_subtotal,
    total = v_total,
    descuento = v_desc,
    cliente_nombre = p_cliente_nombre,
    cliente_telefono = p_cliente_telefono,
    cliente_email = p_cliente_email,
    cliente_cedula = p_cliente_cedula,
    cliente_ciudad = p_cliente_ciudad,
    cliente_departamento = p_cliente_departamento,
    cliente_direccion = p_cliente_direccion,
    notas = p_notas
  where id = p_id;

  -- 5) Insertar nuevos ítems + descontar stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);
    v_override := coalesce((v_item->>'precio_unitario')::int, 0);
    select * into v_prod from products where id = v_pid;
    v_precio := case when v_override > 0 then v_override else v_prod.precio end;
    v_line := v_precio * v_qty;

    insert into order_items (order_id, product_id, nombre_snapshot, precio_snapshot, cantidad, subtotal)
    values (p_id, v_pid, v_prod.nombre, v_precio, v_qty, v_line);

    update products set stock = stock - v_qty where id = v_pid;
  end loop;

  return p_id;
end;
$$;

-- ============================================================
-- 5) delete_purchase_order  (NUEVO)
--    Resta del stock las cantidades compradas en el lote y elimina
--    el pedido de proveedor (purchase_items se borra por cascada).
--    El stock nunca baja de 0 (greatest).
-- ============================================================
create or replace function delete_purchase_order(p_id text) returns void
language plpgsql
as $$
declare
  v_it record;
begin
  for v_it in select product_id, cantidad from purchase_items where purchase_order_id = p_id
  loop
    if v_it.product_id is not null then
      update products set stock = greatest(0, stock - v_it.cantidad) where id = v_it.product_id;
    end if;
  end loop;

  delete from purchase_orders where id = p_id;  -- cascada borra purchase_items
end;
$$;

-- ============================================================
-- 6) update_purchase_order  (NUEVO)
--    Edición de un lote de compra:
--      1) revierte el stock de los ítems actuales,
--      2) borra los ítems actuales,
--      3) actualiza cabecera (proveedor/fecha/envío/notas),
--      4) reaplica los ítems nuevos (suma stock, fija costo/precio).
--    No crea productos nuevos en la edición: solo opera sobre
--    referencias existentes (las nuevas se crean al "Nuevo pedido").
-- ============================================================
create or replace function update_purchase_order(
  p_id text,
  p_proveedor text,
  p_fecha date,
  p_costo_envio int,
  p_notas text,
  p_items jsonb
) returns text
language plpgsql
as $$
declare
  v_it record;
  v_item jsonb;
  v_pid text;
  v_qty int;
  v_costo int;
  v_venta int;
begin
  if not exists (select 1 from purchase_orders where id = p_id) then
    raise exception 'COMPRA_NO_EXISTE:%', p_id;
  end if;

  -- 1) Revertir stock de los ítems actuales
  for v_it in select product_id, cantidad from purchase_items where purchase_order_id = p_id
  loop
    if v_it.product_id is not null then
      update products set stock = greatest(0, stock - v_it.cantidad) where id = v_it.product_id;
    end if;
  end loop;

  -- 2) Borrar ítems actuales
  delete from purchase_items where purchase_order_id = p_id;

  -- 3) Actualizar cabecera
  update purchase_orders set
    proveedor = p_proveedor,
    fecha = coalesce(p_fecha, current_date),
    costo_envio = coalesce(p_costo_envio, 0),
    notas = p_notas
  where id = p_id;

  -- 4) Reaplicar ítems nuevos
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid   := v_item->>'product_id';
    v_qty   := coalesce((v_item->>'cantidad')::int, 0);
    v_costo := coalesce((v_item->>'costo_unitario')::int, 0);
    v_venta := coalesce((v_item->>'precio_venta')::int, 0);

    if v_pid is null or v_pid = '' or v_qty <= 0 then
      continue;
    end if;

    update products
      set stock = stock + v_qty,
          costo = v_costo,
          precio = v_venta
    where id = v_pid;

    insert into purchase_items (purchase_order_id, product_id, referencia, cantidad, costo_unitario, precio_venta)
    values (p_id, v_pid, nullif(v_item->>'referencia', ''), v_qty, v_costo, v_venta);
  end loop;

  return p_id;
end;
$$;
