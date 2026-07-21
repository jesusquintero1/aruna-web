-- ============================================================
-- MIGRACIÓN: Suscripciones Web Push (notificaciones de pedidos)
--   Guarda las suscripciones push de los dispositivos del admin
--   para enviar una notificación cuando entra un pedido.
--   Idempotente. Correr en el SQL Editor de Supabase.
-- ============================================================
create table if not exists push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Solo el service role (servidor) accede. RLS activo sin políticas => anon/otros
-- no pueden leer ni escribir (el cliente Supabase del servidor usa service_role,
-- que ignora RLS). Consistente con migration-rls.sql.
alter table push_subscriptions enable row level security;
