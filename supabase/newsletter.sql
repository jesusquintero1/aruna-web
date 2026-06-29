-- ============================================================
-- ARÜNA · Migración: suscriptores del newsletter
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
--
-- Captura los correos del formulario de suscripción (footer y blog) con
-- consentimiento explícito (Habeas Data, Ley 1581 de 2012).
-- ============================================================

create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,                 -- guardado en minúsculas por la app
  fuente      text not null default 'footer',-- 'footer' | 'blog'
  consent     boolean not null default true, -- aceptó la política de privacidad
  confirmado  boolean not null default false,-- reservado para doble opt-in futuro
  created_at  timestamptz not null default now()
);

-- Dedupe case-insensitive: la app ya envía el email en minúsculas, así que un
-- índice único sobre la columna plana permite usar upsert(onConflict: 'email').
create unique index if not exists newsletter_subscribers_email_key
  on newsletter_subscribers (email);

create index if not exists newsletter_subscribers_created_idx
  on newsletter_subscribers (created_at desc);

-- RLS: la app escribe con la service-role key (la bypassa). No se crean policies
-- y se revocan permisos a anon/authenticated → la tabla no es accesible desde el
-- cliente. Mismo patrón que el resto de tablas (ver migration-rls.sql).
alter table newsletter_subscribers enable row level security;
revoke all on newsletter_subscribers from anon, authenticated;
