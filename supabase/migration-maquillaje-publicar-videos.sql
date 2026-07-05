-- ============================================================
-- MIGRACIÓN: línea de maquillaje + botón publicar + videos + infografías
-- Idempotente: se puede correr varias veces sin daño.
-- Aplicar en el SQL Editor de Supabase (la app también necesita el deploy).
-- ============================================================

-- 1) Línea de producto: mochilas (existente) o maquillaje.
--    Los productos actuales quedan como 'mochilas'.
alter table products
  add column if not exists linea text not null default 'mochilas';

do $$ begin
  alter table products
    add constraint products_linea_check check (linea in ('mochilas','maquillaje'));
exception when duplicate_object then null; end $$;

-- 2) Publicar / borrador. Los productos existentes quedan publicados
--    (ya estaban visibles); los nuevos nacen como borrador desde la app.
alter table products
  add column if not exists publicado boolean not null default true;

-- 3) Videos del producto (URLs públicas en Storage, junto a las imágenes).
alter table products
  add column if not exists videos text[] not null default '{}';

-- 4) Las categorías también pertenecen a una línea.
alter table categories
  add column if not exists linea text not null default 'mochilas';

do $$ begin
  alter table categories
    add constraint categories_linea_check check (linea in ('mochilas','maquillaje'));
exception when duplicate_object then null; end $$;

-- 5) Ajustes de contenido del sitio (infografías al pie del catálogo, etc.).
create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security; -- deny-all como el resto

-- 6) Índices para los filtros por línea / publicado del storefront.
create index if not exists products_linea_idx on products(linea);
create index if not exists products_publicado_idx on products(publicado);
