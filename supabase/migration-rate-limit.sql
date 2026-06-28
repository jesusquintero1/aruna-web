-- ============================================================
-- ARÜNA · Migración: rate limiting basado en Postgres
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
--
-- No requiere servicios externos (Redis/Upstash): reutiliza la propia
-- base de datos. Pensado para tráfico bajo/medio; cada request protegido
-- añade un round-trip a Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- Tabla de contadores por ventana fija de tiempo.
--   bucket: identificador del límite, p.ej. 'orders:<ip>', 'login:<ip>'
--   window_start: inicio de la ventana (alineado a p_window_seconds)
-- ------------------------------------------------------------
create table if not exists rate_limits (
  bucket       text        not null,
  window_start timestamptz not null,
  count        int         not null default 0,
  primary key (bucket, window_start)
);

create index if not exists rate_limits_window_idx on rate_limits(window_start);

-- ------------------------------------------------------------
-- RPC atómica: incrementa el contador de la ventana actual y devuelve
-- TRUE si la petición está permitida (count <= p_limit), FALSE si se pasa.
-- La atomicidad la garantiza INSERT ... ON CONFLICT DO UPDATE RETURNING.
-- ------------------------------------------------------------
create or replace function rate_limit_hit(
  p_bucket text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql
as $$
declare
  v_window timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count int;
begin
  insert into rate_limits (bucket, window_start, count)
  values (p_bucket, v_window, 1)
  on conflict (bucket, window_start)
    do update set count = rate_limits.count + 1
  returning count into v_count;

  -- Limpieza oportunista de ventanas viejas (barata).
  delete from rate_limits where window_start < now() - make_interval(secs => p_window_seconds * 3);

  return v_count <= p_limit;
end;
$$;

-- RLS: la tabla solo la usa el service_role (que la omite). Sin políticas.
alter table rate_limits enable row level security;
