-- ============================================================
-- ARÜNA · Esquema de base de datos (Supabase / Postgres)
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
  linea text not null default 'mochilas'
    check (linea in ('mochilas','maquillaje')),
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
  -- Línea de producto: mochilas wayuu o maquillaje (cada una con su
  -- dashboard e inventario en el admin y su catálogo en la tienda).
  linea text not null default 'mochilas'
    check (linea in ('mochilas','maquillaje')),
  -- Borrador → publicado: solo los publicados aparecen en la tienda.
  publicado boolean not null default true,
  -- Videos del producto (URLs públicas en Storage).
  videos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists products_categoria_idx on products(categoria_id);
create index if not exists products_destacado_idx on products(destacado);
create index if not exists products_linea_idx on products(linea);
create index if not exists products_publicado_idx on products(publicado);

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
  descuento int not null default 0,        -- descuento global aplicado en POS
  cliente_nombre text,
  cliente_telefono text,
  cliente_email text,
  cliente_cedula text,
  cliente_ciudad text,
  cliente_departamento text,
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
--   Los precios se toman de la DB salvo override del POS (precio_unitario).
--
--   p_items: jsonb array -> [{ "product_id": "...", "cantidad": 1,
--                              "precio_unitario": 0 }, ...]
--   p_descuento: descuento global sobre el subtotal (POS).
-- ============================================================
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
  -- 1) Validar stock AGREGADO por producto (bloqueando la fila). Suma las
  --    cantidades de todas las líneas del mismo product_id para que dos
  --    líneas del mismo producto no puedan pasar la validación por separado.
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

  -- 2) Subtotal por línea (permite precio_unitario distinto por línea).
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

  -- 3) Insertar el pedido
  insert into orders (
    id, channel, estado, metodo_pago, subtotal, total, descuento,
    cliente_nombre, cliente_telefono, cliente_email, cliente_cedula,
    cliente_ciudad, cliente_departamento, cliente_direccion, notas
  ) values (
    p_id, p_channel, p_estado, p_metodo_pago, v_subtotal, v_total, v_desc,
    p_cliente_nombre, p_cliente_telefono, p_cliente_email, p_cliente_cedula,
    p_cliente_ciudad, p_cliente_departamento, p_cliente_direccion, p_notas
  );

  -- 4) Insertar ítems por línea
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

  -- 5) Descontar stock AGREGADO por producto (piso en 0 por seguridad)
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

-- ============================================================
-- RPC: delete_order / update_order
--   Reversión y edición completa de pedidos (ver
--   supabase/migration-edicion-pos.sql para la DB en vivo).
-- ============================================================
create or replace function delete_order(p_id text) returns void
language plpgsql
as $$
declare
  v_it record;
  v_estado text;
begin
  select estado into v_estado from orders where id = p_id;
  -- Un pedido 'cancelado' ya devolvió su stock (release_order / expire);
  -- reponerlo de nuevo inflaría el inventario. Solo se repone si el pedido
  -- todavía reservaba stock.
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

  -- Reponer el stock de los ítems VIEJOS solo si el pedido lo reservaba
  -- (un pedido 'cancelado' ya devolvió su stock).
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

-- ============================================================
-- RPC: set_order_status — cambio de estado consciente del stock
--   activo -> cancelado: repone stock; cancelado -> activo:
--   valida y descuenta. Ver migration-fix-integridad-stock.sql.
-- ============================================================
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
    -- cancelado -> activo: validar y volver a descontar (AGREGADO por producto).
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
-- RPC: delete_purchase_order / update_purchase_order
--   Reversión y edición de lotes de compra (ver
--   supabase/migration-edicion-pos.sql para la DB en vivo).
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
  delete from purchase_orders where id = p_id;
end;
$$;

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

  -- Revertir el stock anterior SIN tope: la resta debe ser exacta para que
  -- "revertir + reaplicar la misma cantidad" sea un no-op (si se topa a 0 aquí
  -- y luego se reaplica sin tope, se resucitan unidades ya vendidas).
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

  -- Tope final: ningún producto tocado debe quedar con stock negativo
  -- (solo aplica a casos de sobreventa; el no-op de arriba ya quedó exacto).
  if array_length(v_affected, 1) is not null then
    update products set stock = greatest(0, stock) where id = any(v_affected);
  end if;

  return p_id;
end;
$$;

-- ============================================================
-- RPC: confirmación de pago online (Mercado Pago)
--   Ver supabase/migration-mercadopago.sql para la DB en vivo.
-- ============================================================
create or replace function mark_order_paid(p_id text, p_ref text)
returns boolean
language plpgsql
as $$
declare
  v_updated int;
begin
  update orders
     set estado = 'pagado',
         pago_referencia = coalesce(p_ref, pago_referencia)
   where id = p_id and estado = 'pendiente';
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

create or replace function release_order(p_id text)
returns boolean
language plpgsql
as $$
declare
  v_estado text;
  v_it record;
begin
  select estado into v_estado from orders where id = p_id;
  if v_estado is null or v_estado <> 'pendiente' then
    return false;
  end if;
  for v_it in select product_id, cantidad from order_items where order_id = p_id
  loop
    if v_it.product_id is not null then
      update products set stock = stock + v_it.cantidad where id = v_it.product_id;
    end if;
  end loop;
  update orders set estado = 'cancelado' where id = p_id;
  return true;
end;
$$;

-- ------------------------------------------------------------
-- AJUSTES DE CONTENIDO DEL SITIO (clave → valor)
--   p.ej. infografia_mochilas / infografia_maquillaje = URL de la
--   imagen que se muestra al pie del catálogo de cada línea.
-- ------------------------------------------------------------
create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- STORAGE: bucket público para imágenes de productos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ============================================================
-- SEGURIDAD (RLS) — ACTIVA
-- El servidor de Next.js usa la SERVICE ROLE key (omite RLS) para TODO el
-- acceso; la app nunca usa la anon key ni un cliente de navegador.
-- RLS está activado en todas las tablas SIN políticas públicas (deny-all
-- para anon/authenticated) como defensa en profundidad. Para la DB en vivo,
-- correr supabase/migration-rls.sql y supabase/migration-rate-limit.sql.
-- ============================================================
alter table products          enable row level security;
alter table categories        enable row level security;
alter table admin_users       enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table purchase_orders   enable row level security;
alter table purchase_items    enable row level security;
alter table finance_movements enable row level security;
alter table site_settings     enable row level security;

-- ============================================================
-- WEB PUSH: suscripciones de notificaciones de pedidos
--   (ver supabase/migration-push-subscriptions.sql para la DB en vivo)
-- ============================================================
create table if not exists push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
