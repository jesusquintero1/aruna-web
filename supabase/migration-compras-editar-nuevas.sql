-- ============================================================
-- ARÜNA · Migración: permitir referencias NUEVAS al editar un pedido de proveedor
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
--
-- Bug que corrige:
--   Al EDITAR un pedido de proveedor existente y agregar una mochila que no
--   correspondía a ninguna referencia previa, el sistema la omitía: la línea
--   nueva se descartaba en silencio y no se creaba el producto.
--
-- Causa: update_purchase_order solo hacía UPDATE de productos existentes; las
--   líneas sin product_id válido caían en `continue`. Esta versión, igual que
--   apply_purchase_order, INSERTA el producto cuando is_new y no existe.
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
  v_is_new boolean;
  v_exists boolean;
begin
  if not exists (select 1 from purchase_orders where id = p_id) then
    raise exception 'COMPRA_NO_EXISTE:%', p_id;
  end if;

  -- 1) Revertir el stock que aplicó la versión anterior de este pedido.
  for v_it in select product_id, cantidad from purchase_items where purchase_order_id = p_id
  loop
    if v_it.product_id is not null then
      update products set stock = greatest(0, stock - v_it.cantidad) where id = v_it.product_id;
    end if;
  end loop;

  delete from purchase_items where purchase_order_id = p_id;

  update purchase_orders set
    proveedor = p_proveedor,
    fecha = coalesce(p_fecha, current_date),
    costo_envio = coalesce(p_costo_envio, 0),
    notas = p_notas
  where id = p_id;

  -- 2) Reaplicar las líneas: inserta productos nuevos o acumula a los existentes.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid   := v_item->>'product_id';
    v_qty   := coalesce((v_item->>'cantidad')::int, 0);
    v_costo := coalesce((v_item->>'costo_unitario')::int, 0);
    v_venta := coalesce((v_item->>'precio_venta')::int, 0);
    v_is_new := coalesce((v_item->>'is_new')::boolean, false);

    if v_pid is null or v_pid = '' or v_qty <= 0 then
      continue;
    end if;

    select exists(select 1 from products where id = v_pid) into v_exists;

    if v_is_new and not v_exists then
      insert into products (id, nombre, descripcion, precio, costo, simbolo, categoria_id, destacado, stock, imagenes, colores)
      values (
        v_pid,
        coalesce(v_item->>'nombre', 'Mochila'),
        coalesce(v_item->>'descripcion', ''),
        v_venta,
        v_costo,
        coalesce(v_item->>'simbolo', 'cardenal'),
        nullif(v_item->>'categoria_id', '')::uuid,
        coalesce((v_item->>'destacado')::boolean, false),
        v_qty,
        '{}',
        '{}'
      );
    else
      update products
        set stock = stock + v_qty,
            costo = v_costo,
            precio = v_venta
      where id = v_pid;
    end if;

    insert into purchase_items (purchase_order_id, product_id, referencia, cantidad, costo_unitario, precio_venta)
    values (p_id, v_pid, nullif(v_item->>'referencia', ''), v_qty, v_costo, v_venta);
  end loop;

  return p_id;
end;
$$;
