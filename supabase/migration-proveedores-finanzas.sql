-- ============================================================
-- ARÜNA · Migración: pedidos de proveedor + finanzas
-- Seguro de correr sobre una base de datos YA desplegada.
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- 1) PRECIO DE COSTO en productos
--    precio        = precio de venta (ya existía)
--    precio_anterior = precio tachado / promo (ya existía)
--    costo         = costo unitario actual (NUEVO)
-- ------------------------------------------------------------
alter table products add column if not exists costo int not null default 0;

-- ------------------------------------------------------------
-- 2) PEDIDOS DE PROVEEDOR (cabecera del lote de compra)
-- ------------------------------------------------------------
create table if not exists purchase_orders (
  id text primary key,                       -- formato PROV-XXXXXX
  proveedor text,
  fecha date not null default current_date,
  costo_envio int not null default 0,        -- flete/encomienda del lote
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists purchase_orders_created_idx on purchase_orders(created_at desc);

-- ------------------------------------------------------------
-- 3) ÍTEMS DEL PEDIDO DE PROVEEDOR (cada referencia comprada)
--    Cada fila es un "lote" de una referencia a un costo dado.
-- ------------------------------------------------------------
create table if not exists purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id text not null references purchase_orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  referencia text,
  cantidad int not null default 1,
  costo_unitario int not null default 0,
  precio_venta int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists purchase_items_order_idx on purchase_items(purchase_order_id);
create index if not exists purchase_items_product_idx on purchase_items(product_id);

-- ------------------------------------------------------------
-- 4) MOVIMIENTOS FINANCIEROS (inversión / gasto / ingreso manual)
--    monto SIEMPRE positivo; el signo lo determina el tipo.
-- ------------------------------------------------------------
create table if not exists finance_movements (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('inversion','gasto','ingreso')),
  asunto text not null,
  descripcion text,
  monto int not null default 0,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists finance_movements_created_idx on finance_movements(created_at desc);

-- ============================================================
-- RPC TRANSACCIONAL: apply_purchase_order
--   Crea la cabecera del pedido, y por cada ítem:
--     - si is_new: inserta el producto (stock = cantidad)
--     - si existe: suma stock y actualiza costo/precio al último lote
--   e inserta la línea en purchase_items. Todo en una transacción.
--
--   p_items: jsonb -> [{
--     "product_id": "...", "is_new": true|false, "nombre": "...",
--     "descripcion": "...", "referencia": "...", "cantidad": 5,
--     "costo_unitario": 90000, "precio_venta": 180000,
--     "categoria_id": null, "simbolo": "cardenal", "destacado": false
--   }, ...]
-- ============================================================
create or replace function apply_purchase_order(
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
  v_item jsonb;
  v_pid text;
  v_qty int;
  v_costo int;
  v_venta int;
  v_is_new boolean;
  v_exists boolean;
begin
  insert into purchase_orders (id, proveedor, fecha, costo_envio, notas)
  values (p_id, p_proveedor, coalesce(p_fecha, current_date), coalesce(p_costo_envio, 0), p_notas);

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_pid   := v_item->>'product_id';
    v_qty   := coalesce((v_item->>'cantidad')::int, 0);
    v_costo := coalesce((v_item->>'costo_unitario')::int, 0);
    v_venta := coalesce((v_item->>'precio_venta')::int, 0);
    v_is_new := coalesce((v_item->>'is_new')::boolean, false);

    if v_pid is null or v_pid = '' then
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
