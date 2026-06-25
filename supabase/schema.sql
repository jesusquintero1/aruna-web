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
  precio int not null default 0,
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
