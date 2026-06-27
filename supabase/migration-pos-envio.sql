-- ============================================================
-- ARÜNA · Migración: datos de envío en pedidos (cédula + departamento)
-- Seguro de correr sobre una base de datos YA desplegada.
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
-- ============================================================

-- 1) Nuevas columnas de cliente para envíos
alter table orders add column if not exists cliente_cedula text;
alter table orders add column if not exists cliente_departamento text;

-- 2) Crear la versión de create_order que recibe cédula y departamento.
--    NO se borra la versión anterior (11 parámetros): queda como sobrecarga
--    para que el código aún desplegado siga funcionando durante el deploy
--    (cero downtime). Tras desplegar, la vieja queda sin uso y puede borrarse
--    opcionalmente con:
--      drop function if exists create_order(
--        text,text,text,text,text,text,text,text,text,text,jsonb);
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
  p_items jsonb
) returns text
language plpgsql
as $$
declare
  v_item jsonb;
  v_pid text;
  v_qty int;
  v_prod products%rowtype;
  v_subtotal int := 0;
  v_line int;
begin
  -- Validar y bloquear filas de producto
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);

    select * into v_prod from products where id = v_pid for update;
    if not found then
      raise exception 'PRODUCTO_NO_EXISTE:%', v_pid;
    end if;
    if v_prod.stock < v_qty then
      raise exception 'SIN_STOCK:%', v_prod.nombre;
    end if;

    v_subtotal := v_subtotal + (v_prod.precio * v_qty);
  end loop;

  -- Insertar el pedido
  insert into orders (
    id, channel, estado, metodo_pago, subtotal, total,
    cliente_nombre, cliente_telefono, cliente_email, cliente_cedula,
    cliente_ciudad, cliente_departamento, cliente_direccion, notas
  ) values (
    p_id, p_channel, p_estado, p_metodo_pago, v_subtotal, v_subtotal,
    p_cliente_nombre, p_cliente_telefono, p_cliente_email, p_cliente_cedula,
    p_cliente_ciudad, p_cliente_departamento, p_cliente_direccion, p_notas
  );

  -- Insertar ítems + descontar stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid := v_item->>'product_id';
    v_qty := coalesce((v_item->>'cantidad')::int, 1);
    select * into v_prod from products where id = v_pid;
    v_line := v_prod.precio * v_qty;

    insert into order_items (order_id, product_id, nombre_snapshot, precio_snapshot, cantidad, subtotal)
    values (p_id, v_pid, v_prod.nombre, v_prod.precio, v_qty, v_line);

    update products set stock = stock - v_qty where id = v_pid;
  end loop;

  return p_id;
end;
$$;
