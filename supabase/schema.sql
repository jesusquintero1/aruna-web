-- ============================================================
-- ARUNA · Esquema de base de datos (Supabase / Postgres)
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
-- ============================================================

-- Extensión para uuid
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- CATEGORÍAS
-- ------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PRODUCTOS
--   id = slug legible (se conservan las URLs/SEO actuales)
--   disponible NO se almacena: se deriva de stock > 0
-- ------------------------------------------------------------
create table if not exists products (
  id text primary key,
  nombre text not null,
  descripcion text not null default '',
  precio int not null default 0,           -- precio de venta
  costo int not null default 0,            -- costo unitario actual
  precio_anterior int,
  imagenes text[] not null default '{}',
  colores text[] not null default '{}',
  categoria_id uuid references categories(id) on delete set null,
  simbolo text not null default 'cardenal'
    check (simbolo in ('colibri','flamenco','cardenal','cactus','lirios','delfines')),
  destacado boolean not null default false,
  stock int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists products_categoria_idx on products(categoria_id);
create index if not exists products_destacado_idx on products(destacado);

-- ------------------------------------------------------------
-- USUARIOS ADMIN (login usuario/contraseña, hash bcrypt)
-- ------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- PEDIDOS / VENTAS  (online y POS comparten tabla)
-- ------------------------------------------------------------
create table if not exists orders (
  id text primary key,                       -- formato ARN-XXXXXX
  channel text not null default 'online' check (channel in ('online','pos')),
  estado text not null default 'pendiente'
    check (estado in ('pendiente','pagado','enviado','cancelado')),
  metodo_pago text,
  subtotal int not null default 0,
  total int not null default 0,
  cliente_nombre text,
  cliente_telefono text,
  cliente_email text,
  cliente_ciudad text,
  cliente_direccion text,
  notas text,
  pago_referencia text,                      -- referencia de la pasarela (Wompi)
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on orders(created_at desc);
create index if not exists orders_estado_idx on orders(estado);

-- ------------------------------------------------------------
-- ÍTEMS DEL PEDIDO  (snapshots de nombre/precio históricos)
-- ------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  nombre_snapshot text not null,
  precio_snapshot int not null,
  cantidad int not null default 1,
  subtotal int not null default 0
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ============================================================
-- RPC TRANSACCIONAL: create_order
--   Valida stock, inserta order + items y descuenta stock,
--   todo en una sola transacción (evita vender 2 veces la
--   última unidad). La usan checkout online y POS.
--   Los precios se toman de la DB (no se confía en el cliente).
--
--   p_items: jsonb array -> [{ "product_id": "...", "cantidad": 1 }, ...]
-- ============================================================
create or replace function create_order(
  p_id text,
  p_channel text,
  p_estado text,
  p_metodo_pago text,
  p_cliente_nombre text,
  p_cliente_telefono text,
  p_cliente_email text,
  p_cliente_ciudad text,
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
    cliente_nombre, cliente_telefono, cliente_email,
    cliente_ciudad, cliente_direccion, notas
  ) values (
    p_id, p_channel, p_estado, p_metodo_pago, v_subtotal, v_subtotal,
    p_cliente_nombre, p_cliente_telefono, p_cliente_email,
    p_cliente_ciudad, p_cliente_direccion, p_notas
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

-- ============================================================
-- PEDIDOS DE PROVEEDOR + FINANZAS
--   (definición canónica; ver también
--    supabase/migration-proveedores-finanzas.sql para DB en vivo)
-- ============================================================
create table if not exists purchase_orders (
  id text primary key,                       -- formato PROV-XXXXXX
  proveedor text,
  fecha date not null default current_date,
  costo_envio int not null default 0,
  notas text,
  created_at timestamptz not null default now()
);
create index if not exists purchase_orders_created_idx on purchase_orders(created_at desc);

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

-- ============================================================
-- STORAGE: bucket público para imágenes de productos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ============================================================
-- NOTA SOBRE SEGURIDAD (RLS)
-- El servidor de Next.js usa la SERVICE ROLE key (omite RLS).
-- Mantén estas tablas SIN políticas públicas: nunca expongas la
-- anon key con acceso de escritura. (Fase de pulido: activar RLS
-- y políticas de solo-lectura para columnas públicas si se quiere
-- consultar desde el navegador.)
-- ============================================================
