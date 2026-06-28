-- ============================================================
-- ARÜNA · Migración: expiración de carritos abandonados
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
--
-- Problema que resuelve:
--   El checkout online crea el pedido en estado 'pendiente' y YA reserva stock
--   (create_order lo descuenta). Si el cliente abandona el pago en Mercado Pago,
--   ese pedido queda 'pendiente' para siempre y el stock sigue bloqueado hasta
--   que el admin lo cancela a mano. Esto libera ese stock automáticamente.
--
-- Qué hace:
--   1) Crea expire_pending_orders(p_minutes): cancela y repone el stock de los
--      pedidos ONLINE 'pendiente' más viejos que p_minutes (default 60).
--   2) (Opcional) Programa pg_cron para correrla sola cada 15 minutos.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Función de expiración
-- ------------------------------------------------------------
-- Repone el stock reservado y marca 'cancelado' los pedidos ONLINE 'pendiente'
-- creados hace más de p_minutes. Solo toca el canal 'online' (un pedido POS
-- pendiente puede ser un abono/apartado legítimo, no se toca). Devuelve cuántos
-- pedidos expiró. Idempotente y seguro de correr en cualquier momento.
--
-- `for update skip locked` evita pelear con el webhook de Mercado Pago: si una
-- transacción está confirmando el pago de un pedido en ese instante, lo salta.
create or replace function expire_pending_orders(p_minutes int default 60)
returns int
language plpgsql
as $$
declare
  v_count int := 0;
  v_order record;
  v_it record;
begin
  for v_order in
    select id
      from orders
     where estado = 'pendiente'
       and channel = 'online'
       and created_at < now() - make_interval(mins => greatest(p_minutes, 1))
     for update skip locked
  loop
    -- Repone el stock que el pedido tenía reservado.
    for v_it in
      select product_id, cantidad from order_items where order_id = v_order.id
    loop
      if v_it.product_id is not null then
        update products set stock = stock + v_it.cantidad where id = v_it.product_id;
      end if;
    end loop;

    -- Cancela el pedido y deja rastro en las notas.
    update orders
       set estado = 'cancelado',
           notas = trim(both ' ' from
             coalesce(notas, '') || ' [auto-expirado: carrito abandonado]')
     where id = v_order.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- ------------------------------------------------------------
-- 2) Programación automática con pg_cron (OPCIONAL pero recomendado)
-- ------------------------------------------------------------
-- pg_cron corre la expiración dentro de la propia base de datos, así que funciona
-- aunque el sitio (Netlify) esté caído. Si prefieres no usar pg_cron, omite esta
-- sección y dispara el endpoint /api/cron/expire-orders desde un cron externo.
--
-- En Supabase, primero habilita la extensión en:
--   Database → Extensions → busca "pg_cron" → Enable
-- (o deja que el `create extension` de abajo lo intente).
--
-- Si pg_cron NO está disponible, esta sección dará error: ignóralo, la función
-- de arriba ya quedó creada y el endpoint HTTP sigue sirviendo.

create extension if not exists pg_cron;

-- Programa (o reprograma, por nombre) la limpieza cada 15 minutos, expirando los
-- pedidos pendientes con más de 60 minutos de antigüedad.
select cron.schedule(
  'expire-pending-orders',
  '*/15 * * * *',
  $$ select expire_pending_orders(60) $$
);

-- Para ver el job programado:        select * from cron.job;
-- Para ver el historial de corridas: select * from cron.job_run_details order by start_time desc limit 20;
-- Para desprogramarlo:               select cron.unschedule('expire-pending-orders');
