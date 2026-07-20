-- ============================================================
-- MIGRACIÓN: Integridad de stock (idempotente)
--   Corrige 3 bugs de inventario y añade set_order_status.
--   Correr en el SQL Editor de Supabase ANTES de desplegar el
--   código que llama a set_order_status. Retrocompatible: las
--   firmas de create_order / update_order / delete_order no cambian.
--
--   A1  create_order  -> valida y descuenta stock AGREGADO por
--       producto (evita oversell con líneas duplicadas del mismo
--       product_id) y usa greatest(0, ...) al descontar.
--   A2  update_order / delete_order -> solo reponen stock si el
--       pedido AÚN reservaba stock (estado <> 'cancelado'); así
--       editar/borrar un pedido ya cancelado no infla inventario.
--   A3  set_order_status(p_id, p_estado) -> cambio de estado
--       consciente del stock: activo->cancelado repone;
--       cancelado->activo valida y descuenta.
--
--   Modelo de inventario: un pedido "reserva stock" en CUALQUIER
--   estado distinto de 'cancelado'.
-- ============================================================

-- ------------------------------------------------------------
-- A1) create_order
-- ------------------------------------------------------------
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
  v_agg record;
begin
  -- 1) Validar stock AGREGADO por producto (bloqueando la fila).
  --    Suma las cantidades de TODAS las líneas del mismo product_id,
  --    de modo que dos líneas del mismo producto no puedan pasar la
  --    validación por separado (oversell).
  for v_agg in
    select item->>'product_id' as pid,
           sum(coalesce((item->>'cantidad')::int, 1)) as qty
    from jsonb_array_elements(p_items) as item
    group by item->>'product_id'
  loop
    select * into v_prod from products where id = v_agg.pid for update;
    if not found then
      raise exception 'PRODUCTO_NO_EXISTE:%', v_agg.pid;
    end if;
    if v_prod.stock < v_agg.qty then
      raise exception 'SIN_STOCK:%', v_prod.nombre;
    end if;
  end loop;

  -- 2) Calcular subtotal por línea (permite precio_unitario distinto por línea).
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);
    v_override := coalesce((v_item->>'precio_unitario')::int, 0);
    select * into v_prod from products where id = v_pid;
    v_precio := case when v_override > 0 then v_override else v_prod.precio end;
    v_subtotal := v_subtotal + (v_precio * v_qty);
  end loop;

  v_total := greatest(0, v_subtotal - v_desc);

  -- 3) Insertar el pedido.
  insert into orders (
    id, channel, estado, metodo_pago, subtotal, total, descuento,
    cliente_nombre, cliente_telefono, cliente_email, cliente_cedula,
    cliente_ciudad, cliente_departamento, cliente_direccion, notas
  ) values (
    p_id, p_channel, p_estado, p_metodo_pago, v_subtotal, v_total, v_desc,
    p_cliente_nombre, p_cliente_telefono, p_cliente_email, p_cliente_cedula,
    p_cliente_ciudad, p_cliente_departamento, p_cliente_direccion, p_notas
  );

  -- 4) Insertar ítems por línea.
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
  end loop;

  -- 5) Descontar stock AGREGADO por producto (piso en 0 por seguridad).
  for v_agg in
    select item->>'product_id' as pid,
           sum(coalesce((item->>'cantidad')::int, 1)) as qty
    from jsonb_array_elements(p_items) as item
    group by item->>'product_id'
  loop
    update products set stock = greatest(0, stock - v_agg.qty) where id = v_agg.pid;
  end loop;

  return p_id;
end;
$$;

-- ------------------------------------------------------------
-- A2) delete_order — repone stock SOLO si el pedido lo reservaba
-- ------------------------------------------------------------
create or replace function delete_order(p_id text) returns void
language plpgsql
as $$
declare
  v_it record;
  v_estado text;
begin
  select estado into v_estado from orders where id = p_id;
  -- Un pedido 'cancelado' ya devolvió su stock (release_order / expire).
  -- Reponer de nuevo inflaría el inventario, así que solo se repone si
  -- el pedido todavía reservaba stock.
  if v_estado is not null and v_estado <> 'cancelado' then
    for v_it in select product_id, cantidad from order_items where order_id = p_id
    loop
      if v_it.product_id is not null then
        update products set stock = stock + v_it.cantidad where id = v_it.product_id;
      end if;
    end loop;
  end if;
  delete from orders where id = p_id;
end;
$$;

-- ------------------------------------------------------------
-- A2) update_order — reposición/descuento condicionados al estado
-- ------------------------------------------------------------
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
  v_old_estado text;
  v_agg record;
begin
  select estado into v_old_estado from orders where id = p_id;
  if not found then
    raise exception 'PEDIDO_NO_EXISTE:%', p_id;
  end if;

  -- Reponer el stock de los ítems VIEJOS solo si el pedido lo reservaba.
  if v_old_estado <> 'cancelado' then
    for v_it in select product_id, cantidad from order_items where order_id = p_id
    loop
      if v_it.product_id is not null then
        update products set stock = stock + v_it.cantidad where id = v_it.product_id;
      end if;
    end loop;
  end if;

  delete from order_items where order_id = p_id;

  -- Validar stock AGREGADO de los ítems NUEVOS solo si el nuevo estado reserva stock.
  if p_estado <> 'cancelado' then
    for v_agg in
      select item->>'product_id' as pid,
             sum(coalesce((item->>'cantidad')::int, 1)) as qty
      from jsonb_array_elements(p_items) as item
      group by item->>'product_id'
    loop
      select * into v_prod from products where id = v_agg.pid for update;
      if not found then
        raise exception 'PRODUCTO_NO_EXISTE:%', v_agg.pid;
      end if;
      if v_prod.stock < v_agg.qty then
        raise exception 'SIN_STOCK:%', v_prod.nombre;
      end if;
    end loop;
  end if;

  -- Subtotal por línea.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);
    v_override := coalesce((v_item->>'precio_unitario')::int, 0);
    select * into v_prod from products where id = v_pid;
    if not found then
      raise exception 'PRODUCTO_NO_EXISTE:%', v_pid;
    end if;
    v_precio := case when v_override > 0 then v_override else v_prod.precio end;
    v_subtotal := v_subtotal + (v_precio * v_qty);
  end loop;

  v_total := greatest(0, v_subtotal - v_desc);

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

  -- Insertar ítems nuevos por línea.
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
  end loop;

  -- Descontar stock AGREGADO solo si el nuevo estado reserva stock.
  if p_estado <> 'cancelado' then
    for v_agg in
      select item->>'product_id' as pid,
             sum(coalesce((item->>'cantidad')::int, 1)) as qty
      from jsonb_array_elements(p_items) as item
      group by item->>'product_id'
    loop
      update products set stock = greatest(0, stock - v_agg.qty) where id = v_agg.pid;
    end loop;
  end if;

  return p_id;
end;
$$;

-- ------------------------------------------------------------
-- A3) set_order_status — cambio de estado consciente del stock
-- ------------------------------------------------------------
create or replace function set_order_status(p_id text, p_estado text) returns void
language plpgsql
as $$
declare
  v_old text;
  v_it record;
  v_prod products%rowtype;
begin
  select estado into v_old from orders where id = p_id;
  if not found then
    raise exception 'PEDIDO_NO_EXISTE:%', p_id;
  end if;
  if p_estado not in ('pendiente', 'pagado', 'enviado', 'cancelado') then
    raise exception 'ESTADO_INVALIDO:%', p_estado;
  end if;
  if v_old = p_estado then
    return; -- sin cambios
  end if;

  if v_old <> 'cancelado' and p_estado = 'cancelado' then
    -- activo -> cancelado: reponer stock reservado.
    for v_it in select product_id, cantidad from order_items where order_id = p_id
    loop
      if v_it.product_id is not null then
        update products set stock = stock + v_it.cantidad where id = v_it.product_id;
      end if;
    end loop;

  elsif v_old = 'cancelado' and p_estado <> 'cancelado' then
    -- cancelado -> activo: validar y volver a descontar stock (AGREGADO por producto).
    for v_it in
      select product_id as pid, sum(cantidad) as qty
      from order_items
      where order_id = p_id and product_id is not null
      group by product_id
    loop
      select * into v_prod from products where id = v_it.pid for update;
      if not found then
        raise exception 'PRODUCTO_NO_EXISTE:%', v_it.pid;
      end if;
      if v_prod.stock < v_it.qty then
        raise exception 'SIN_STOCK:%', v_prod.nombre;
      end if;
    end loop;

    for v_it in
      select product_id as pid, sum(cantidad) as qty
      from order_items
      where order_id = p_id and product_id is not null
      group by product_id
    loop
      update products set stock = greatest(0, stock - v_it.qty) where id = v_it.pid;
    end loop;
  end if;
  -- Transición entre estados activos (pendiente/pagado/enviado): sin cambio de stock.

  update orders set estado = p_estado where id = p_id;
end;
$$;

-- ------------------------------------------------------------
-- Limpieza: elimina una sobrecarga LEGACY de create_order (11 args, sin
-- p_descuento) que puede haber quedado de migraciones antiguas. El código
-- actual llama SIEMPRE a la versión de 14 args (definida arriba, ya corregida);
-- la vieja es código muerto con la lógica de oversell. Se busca por aridad para
-- no depender de los tipos exactos. Idempotente: si no existe, no hace nada.
-- ------------------------------------------------------------
do $$
declare r regprocedure;
begin
  for r in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'create_order'
      and n.nspname = 'public'
      and array_length(p.proargtypes, 1) = 11
  loop
    execute 'drop function ' || r::text;
    raise notice 'create_order legacy (11 args) eliminada: %', r::text;
  end loop;
end $$;
