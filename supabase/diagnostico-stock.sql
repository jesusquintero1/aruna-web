-- ============================================================
-- ARÜNA · Diagnóstico y recuperación de STOCK inflado
-- Correr en: Supabase → SQL Editor. Las consultas 1 y 2 SOLO LEEN
-- (no cambian nada). La 3 (opcional) corrige; léela antes de ejecutar.
-- ============================================================

-- ------------------------------------------------------------
-- 1) STOCK ACTUAL vs. ESPERADO según el historial real
--    esperado = (todo lo comprado a proveedor) − (todo lo vendido en
--    pedidos NO cancelados). Los pedidos 'cancelado' ya devolvieron su
--    stock, por eso no cuentan como venta.
--
--    "exceso" > 0  → el producto tiene MÁS stock del que debería
--                    (probable inventario fantasma por el bug de edición).
-- ------------------------------------------------------------
select
  p.id,
  p.nombre,
  p.stock                                                   as stock_actual,
  coalesce(c.comprado, 0)                                   as total_comprado,
  coalesce(v.vendido, 0)                                    as total_vendido,
  coalesce(c.comprado, 0) - coalesce(v.vendido, 0)          as stock_esperado,
  p.stock - (coalesce(c.comprado, 0) - coalesce(v.vendido, 0)) as exceso
from products p
left join (
  select product_id, sum(cantidad) as comprado
    from purchase_items
   where product_id is not null
   group by product_id
) c on c.product_id = p.id
left join (
  select oi.product_id, sum(oi.cantidad) as vendido
    from order_items oi
    join orders o on o.id = oi.order_id
   where oi.product_id is not null
     and o.estado in ('pendiente', 'pagado', 'enviado')   -- ventas vigentes
   group by oi.product_id
) v on v.product_id = p.id
order by exceso desc, p.nombre;

-- IMPORTANTE — léelo antes de confiar en "stock_esperado":
--   * Es exacto SOLO para productos cuyo stock entró por "Compras" (proveedor).
--   * Para productos creados con "Nuevo producto" (formulario) o por el seed,
--     su stock inicial NO está en purchase_items, así que su stock_esperado
--     saldrá MÁS BAJO de lo real (no te asustes por un "exceso" en esos).
--   * Confía en las filas donde total_comprado > 0 y el exceso coincide
--     aproximadamente con lo que recuerdas haber vendido.

-- ------------------------------------------------------------
-- 2) Pista extra: pedidos de proveedor EDITADOS (los que dispararon el bug).
--    Si recuerdas haber editado una compra recientemente, mira sus líneas.
-- ------------------------------------------------------------
-- select po.id, po.proveedor, po.fecha, pi.product_id, pi.cantidad
--   from purchase_orders po
--   join purchase_items pi on pi.purchase_order_id = po.id
--  order by po.created_at desc;

-- ------------------------------------------------------------
-- 3) CORRECCIÓN (OPCIONAL · destructiva) — recalcula el stock al valor del
--    historial SOLO para productos que entraron por compras. Haz primero un
--    respaldo/captura de la consulta 1. Para una tienda artesanal pequeña,
--    lo más seguro es un conteo físico y ajustar a mano cada pieza afectada;
--    usa esto solo si confías en que TODO tu stock entró por "Compras".
-- ------------------------------------------------------------
-- update products p
--    set stock = greatest(0, sub.esperado)
--   from (
--     select p.id,
--            coalesce(c.comprado,0) - coalesce(v.vendido,0) as esperado,
--            coalesce(c.comprado,0) as comprado
--       from products p
--       left join (select product_id, sum(cantidad) comprado from purchase_items
--                   where product_id is not null group by product_id) c on c.product_id = p.id
--       left join (select oi.product_id, sum(oi.cantidad) vendido from order_items oi
--                   join orders o on o.id = oi.order_id
--                  where oi.product_id is not null and o.estado in ('pendiente','pagado','enviado')
--                  group by oi.product_id) v on v.product_id = p.id
--   ) sub
--  where p.id = sub.id
--    and sub.comprado > 0          -- solo productos con historial de compra
--    and p.stock <> greatest(0, sub.esperado);
