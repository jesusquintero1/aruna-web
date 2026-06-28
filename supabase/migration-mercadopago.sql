-- ============================================================
-- ARÜNA · Migración: confirmación de pago (Mercado Pago)
-- Seguro de correr sobre una base de datos YA desplegada (idempotente).
-- Ejecuta este archivo completo en: Supabase → SQL Editor → New query
--
-- Flujo del pago online:
--   1) El pedido se crea 'pendiente' y YA reserva stock (create_order lo descuenta).
--   2) Webhook de Mercado Pago confirma:
--        - aprobado  -> mark_order_paid  (pendiente -> pagado)
--        - rechazado -> release_order    (pendiente -> cancelado + repone stock)
-- ============================================================

-- Marca un pedido como pagado (solo si estaba pendiente). Idempotente.
-- Devuelve true si efectivamente cambió de estado.
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

-- Libera un pedido NO pagado: repone el stock reservado y lo marca 'cancelado'.
-- Solo actúa sobre pedidos 'pendiente' (nunca toca pagados/enviados). Idempotente.
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
