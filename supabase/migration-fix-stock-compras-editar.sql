-- ============================================================
-- ARÜNA · Migración: corrige el INFLADO de stock al EDITAR una compra
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
--
-- Bug que corrige (inventario fantasma):
--   update_purchase_order revertía el stock anterior CON tope en 0
--   (`greatest(0, stock - cantidad)`) pero lo reaplicaba SIN tope
--   (`stock + cantidad`). Si las unidades de esa compra YA se habían vendido
--   (stock por debajo de la cantidad de la línea), revertir no podía restarlas
--   pero reaplicar sí las volvía a sumar → cada edición de la compra resucitaba
--   unidades ya vendidas. Solo abrir y guardar una compra inflaba el inventario.
--
-- Síntoma: mochilas agotadas reaparecían "con stock" y el total de unidades del
--   dashboard subía solo (p. ej. de 23 a 36).
--
-- Arreglo:
--   - Revertir SIN tope (resta exacta de la cantidad anterior) para que
--     "revertir + reaplicar la misma cantidad" sea verdaderamente un no-op.
--   - Aplicar el tope a 0 UNA sola vez, AL FINAL, solo sobre los productos
--     tocados (evita que un producto quede con stock negativo si estaba
--     sobrevendido y se redujo la compra).
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
  v_affected text[] := '{}';   -- productos tocados (para el tope final)
begin
  if not exists (select 1 from purchase_orders where id = p_id) then
    raise exception 'COMPRA_NO_EXISTE:%', p_id;
  end if;

  -- 1) Revertir el stock que aplicó la versión anterior de este pedido.
  --    SIN tope: la resta debe ser exacta para que el revert sea reversible.
  for v_it in select product_id, cantidad from purchase_items where purchase_order_id = p_id
  loop
    if v_it.product_id is not null then
      update products set stock = stock - v_it.cantidad where id = v_it.product_id;
      v_affected := array_append(v_affected, v_it.product_id);
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

    v_affected := array_append(v_affected, v_pid);

    insert into purchase_items (purchase_order_id, product_id, referencia, cantidad, costo_unitario, precio_venta)
    values (p_id, v_pid, nullif(v_item->>'referencia', ''), v_qty, v_costo, v_venta);
  end loop;

  -- 3) Tope final: ningún producto tocado debe quedar con stock negativo.
  --    (Solo afecta a casos de sobreventa; el no-op de arriba ya quedó exacto.)
  if array_length(v_affected, 1) is not null then
    update products set stock = greatest(0, stock) where id = any(v_affected);
  end if;

  return p_id;
end;
$$;
