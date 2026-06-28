-- ============================================================
-- ARÜNA · Migración: activar Row Level Security (RLS)
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
--
-- La app SIEMPRE accede con la SERVICE ROLE key (atributo BYPASSRLS), así
-- que activar RLS sin políticas NO rompe nada de la aplicación: solo cierra
-- por completo el acceso de los roles `anon` y `authenticated` (que la app
-- nunca usa). Es defensa en profundidad: aunque se filtrara la anon key,
-- estas tablas quedan inaccesibles.
--
-- Reversible con:  alter table <tabla> disable row level security;
-- ============================================================

alter table products          enable row level security;
alter table categories        enable row level security;
alter table admin_users       enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table purchase_orders   enable row level security;
alter table purchase_items    enable row level security;
alter table finance_movements enable row level security;

-- rate_limits también (por si se corrió antes migration-rate-limit.sql).
-- Si la tabla aún no existe, corre primero migration-rate-limit.sql.
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'rate_limits') then
    execute 'alter table rate_limits enable row level security';
  end if;
end $$;

-- ------------------------------------------------------------
-- Defensa en profundidad opcional: revocar permisos de los roles públicos.
-- RLS ya bloquea las filas; esto además quita el privilegio de tabla.
-- ------------------------------------------------------------
revoke all on products, categories, admin_users, orders, order_items,
              purchase_orders, purchase_items, finance_movements
  from anon, authenticated;
