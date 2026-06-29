import { getAnalytics, type ProductAnalytics } from "@/lib/db/analytics";
import { formatPrice } from "@/lib/utils";
import {
  TrendingUp, Coins, Percent, Receipt, Boxes, ShoppingBag, Wallet, AlertTriangle,
  Lightbulb, PackageX, RefreshCw, Tag, Crown, ArrowUpRight, Rocket, Sprout,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmt = (n: number) => formatPrice(n);
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Tarjeta de KPI. */
function Kpi({ label, value, hint, icon: Icon, color }: { label: string; value: string; hint?: string; icon: typeof Coins; color: string }) {
  return (
    <div className="bg-white border border-cream-dark rounded-2xl p-5">
      <Icon className={`w-6 h-6 ${color}`} />
      <p className="text-xl lg:text-2xl font-black text-chocolate mt-3 leading-tight">{value}</p>
      <p className="text-xs text-chocolate font-bold uppercase tracking-wide">{label}</p>
      {hint && <p className="text-[11px] text-chocolate-light mt-0.5">{hint}</p>}
    </div>
  );
}

/** Fila de barra horizontal (para rankings). */
function HBar({ nombre, valor, max, etiqueta, color = "bg-caribe" }: { nombre: string; valor: number; max: number; etiqueta: string; color?: string }) {
  const w = max > 0 ? Math.max(3, Math.round((valor / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-chocolate font-semibold truncate">{nombre}</span>
        <span className="text-chocolate-light font-bold whitespace-nowrap">{etiqueta}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-cream overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

const RECO_META: Record<string, { icon: typeof Lightbulb; color: string; bg: string }> = {
  lanzamiento: { icon: Rocket, color: "text-caribe", bg: "bg-caribe/10 border-caribe/30" },
  reabastecer: { icon: RefreshCw, color: "text-caribe", bg: "bg-caribe/10 border-caribe/30" },
  liquidar: { icon: PackageX, color: "text-flamenco", bg: "bg-flamenco/10 border-flamenco/30" },
  promocionar: { icon: Crown, color: "text-gold-deep", bg: "bg-gold-lux/10 border-gold-lux/40" },
  precio: { icon: Tag, color: "text-chocolate", bg: "bg-sol/15 border-sol/40" },
  concentracion: { icon: AlertTriangle, color: "text-cactus", bg: "bg-cactus/10 border-cactus/30" },
};

export default async function AnaliticaPage() {
  const a = await getAnalytics();

  if (!a.configured) {
    return (
      <div className="space-y-6">
        <h1 className="font-lux font-bold text-3xl text-chocolate">Analítica</h1>
        <p className="bg-sol/15 border border-sol/40 rounded-2xl p-4 text-sm text-chocolate">
          Configura Supabase para ver la analítica con tus datos reales.
        </p>
      </div>
    );
  }

  if (a.pedidosPagados === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-lux font-bold text-3xl text-chocolate">Analítica</h1>
        <p className="bg-white border border-cream-dark rounded-2xl p-6 text-sm text-chocolate-light text-center">
          Aún no hay ventas pagadas para analizar. Cuando registres ventas en el POS o lleguen pedidos online, aquí verás tus métricas de crecimiento.
        </p>
      </div>
    );
  }

  const maxVend = Math.max(...a.topVendidos.map((p) => p.unidadesVendidas), 1);
  const maxGan = Math.max(...a.topGanancia.map((p) => p.gananciaBruta), 1);
  const maxCatIng = Math.max(...a.porCategoria.map((c) => c.ingresos), 1);
  const maxDia = Math.max(...a.ventasPorDia.map((d) => d.ingresos), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-lux font-bold text-3xl text-chocolate">Analítica del negocio</h1>
        <p className="text-sm text-chocolate-light">Métricas y recomendaciones para decidir y crecer, calculadas con tus datos reales.</p>
      </div>

      {/* Aviso de etapa de lanzamiento */}
      {a.etapaLanzamiento && (
        <div className="flex items-start gap-3 bg-caribe/10 border border-caribe/30 rounded-2xl p-4 text-sm text-chocolate">
          <Rocket className="w-5 h-5 text-caribe flex-shrink-0 mt-0.5" />
          <div>
            <b>Negocio en etapa de lanzamiento.</b> Tu catálogo tiene ~{a.edadCatalogoDias} {a.edadCatalogoDias === 1 ? "día" : "días"} y aún no has hecho marketing.
            Que muchos productos no hayan vendido todavía es <b>normal</b> — no es inventario muerto. La analítica lo trata como inventario
            <b> nuevo (en introducción)</b> y solo marcará algo como “muerto” si pasa {a.diasMaduracion}+ días sin vender. Interpreta los números como una línea base, no como un diagnóstico final.
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Ingresos (pagados)" value={fmt(a.ingresosTotales)} hint={`${a.pedidosPagados} ventas`} icon={Coins} color="text-gold-deep" />
        <Kpi label="Ganancia bruta" value={fmt(a.gananciaBrutaReal)} hint="Ingresos − costo de lo vendido (est.)" icon={TrendingUp} color="text-cactus" />
        <Kpi label="Margen bruto" value={pct(a.margenBrutoPct)} hint="Sobre lo vendido" icon={Percent} color="text-caribe" />
        <Kpi label="Ticket promedio" value={fmt(a.ticketPromedio)} hint="Por venta" icon={Receipt} color="text-chocolate" />
        <Kpi label="Unidades vendidas" value={String(a.unidadesVendidas)} hint={`${a.productosVendidosDistintos} productos distintos`} icon={ShoppingBag} color="text-flamenco" />
        <Kpi label="Capital en stock" value={fmt(a.capitalEnStock)} hint="Stock × costo" icon={Wallet} color="text-chocolate" />
        {a.inventarioMuerto.length > 0 ? (
          <Kpi label="Inventario muerto" value={fmt(a.inventarioMuertoValor)} hint={`${a.inventarioMuerto.length} sin vender +${a.diasMaduracion}d`} icon={Boxes} color="text-flamenco" />
        ) : (
          <Kpi label="Inventario nuevo" value={fmt(a.enIntroduccionValor)} hint={`${a.enIntroduccion.length} en introducción`} icon={Sprout} color="text-cactus" />
        )}
        <Kpi label="Por reabastecer" value={String(a.reabastecer.length)} hint="Ya vendieron y stock bajo" icon={RefreshCw} color="text-caribe" />
      </div>

      {/* Recomendaciones */}
      {a.recomendaciones.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-title font-extrabold text-chocolate flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-gold-deep" /> Recomendaciones para crecer
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {a.recomendaciones.map((r, i) => {
              const meta = RECO_META[r.tipo];
              return (
                <div key={i} className={`border rounded-2xl p-5 ${meta.bg}`}>
                  <div className="flex items-start gap-3">
                    <meta.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${meta.color}`} />
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-title font-extrabold text-chocolate">{r.titulo}</h3>
                        {r.prioridad === "alta" && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-flamenco bg-flamenco/15 px-2 py-0.5 rounded-full">Prioridad alta</span>
                        )}
                      </div>
                      <p className="text-sm text-chocolate-light">{r.detalle}</p>
                      <ul className="space-y-1 pt-1">
                        {r.productos.map((p, j) => (
                          <li key={j} className="text-xs text-chocolate flex items-start gap-1.5">
                            <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-chocolate-light" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tendencia de ventas */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5">
        <h2 className="font-title font-extrabold text-chocolate mb-4">Tendencia de ventas por día</h2>
        <div className="flex items-end gap-2 h-40 overflow-x-auto pb-1">
          {a.ventasPorDia.map((d) => {
            const h = Math.max(4, Math.round((d.ingresos / maxDia) * 100));
            return (
              <div key={d.fecha} className="flex flex-col items-center gap-1.5 min-w-[44px] flex-1">
                <span className="text-[10px] font-bold text-chocolate-light">{fmt(d.ingresos)}</span>
                <div className="w-full flex items-end" style={{ height: "110px" }}>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-caribe to-cactus" style={{ height: `${h}%` }} title={`${d.pedidos} ventas · ${d.unidades} u.`} />
                </div>
                <span className="text-[10px] text-chocolate-light whitespace-nowrap">{d.fecha.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Más vendidos + Rentabilidad */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-4">
          <h2 className="font-title font-extrabold text-chocolate">Más vendidos (unidades)</h2>
          {a.topVendidos.slice(0, 8).map((p) => (
            <HBar key={p.id} nombre={p.nombre} valor={p.unidadesVendidas} max={maxVend} etiqueta={`${p.unidadesVendidas} u · ${fmt(p.ingresos)}`} color="bg-caribe" />
          ))}
          {a.topVendidos.length === 0 && <p className="text-sm text-chocolate-light">Sin datos de ventas.</p>}
        </div>

        <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-4">
          <h2 className="font-title font-extrabold text-chocolate">Más rentables (ganancia aportada)</h2>
          {a.topGanancia.slice(0, 8).map((p) => (
            <HBar key={p.id} nombre={`${p.nombre} · ${pct(p.margenPct)} margen`} valor={p.gananciaBruta} max={maxGan} etiqueta={fmt(p.gananciaBruta)} color="bg-cactus" />
          ))}
          {a.topGanancia.length === 0 && <p className="text-sm text-chocolate-light">Sin datos de ganancia.</p>}
        </div>
      </div>

      {/* Rotación: inventario muerto (maduro) o en introducción (nuevo) + reabastecer */}
      <div className="grid lg:grid-cols-2 gap-6">
        {a.inventarioMuerto.length > 0 ? (
          <RotacionTabla
            titulo={`Inventario muerto (${a.diasMaduracion}+ días sin vender)`}
            subtitulo="Con stock, sin una sola venta tras tiempo suficiente. Capital atrapado."
            icon={PackageX}
            iconColor="text-flamenco"
            rows={a.inventarioMuerto.slice(0, 10)}
            render={(p) => ({ izq: p.nombre, der: `${p.stock} u · ${fmt(p.capitalEnStock)}`, sub: `${p.diasDesdeAlta} días en catálogo` })}
            vacio="¡Bien! Nada lleva demasiado tiempo sin vender."
          />
        ) : (
          <RotacionTabla
            titulo="Inventario nuevo (en introducción)"
            subtitulo={`Aún sin su primera venta, pero con menos de ${a.diasMaduracion} días. Es normal: dales tiempo y tráfico.`}
            icon={Sprout}
            iconColor="text-cactus"
            rows={a.enIntroduccion.slice(0, 10)}
            render={(p) => ({ izq: p.nombre, der: `${p.stock} u · ${fmt(p.capitalEnStock)}`, sub: `${p.diasDesdeAlta} ${p.diasDesdeAlta === 1 ? "día" : "días"} en catálogo` })}
            vacio="Todos tus productos ya han vendido al menos una vez."
          />
        )}
        <RotacionTabla
          titulo="Reabastecer pronto"
          subtitulo="Venden y están en stock bajo. No te quedes sin ellos."
          icon={RefreshCw}
          iconColor="text-caribe"
          rows={a.reabastecer.slice(0, 10)}
          render={(p) => ({ izq: p.nombre, der: `quedan ${p.stock}`, sub: `vendió ${p.unidadesVendidas} u` })}
          vacio="Sin alertas de reabastecimiento por ahora."
        />
      </div>

      {/* Por categoría */}
      <div className="bg-white border border-cream-dark rounded-2xl p-5 space-y-4">
        <h2 className="font-title font-extrabold text-chocolate">Ingresos por categoría</h2>
        {a.porCategoria.filter((c) => c.ingresos > 0).map((c) => (
          <HBar key={c.categoria} nombre={c.categoria} valor={c.ingresos} max={maxCatIng} etiqueta={`${fmt(c.ingresos)} · ${c.unidades} u`} color="bg-gold-deep" />
        ))}
        {a.porCategoria.every((c) => c.ingresos === 0) && <p className="text-sm text-chocolate-light">Sin ventas por categoría aún.</p>}
      </div>

      <p className="text-[11px] text-chocolate-light">
        La ganancia y el margen usan el costo actual de cada producto como aproximación del costo de lo vendido.
        Las recomendaciones son automáticas según tus datos; úsalas como guía, no como regla absoluta.
      </p>
    </div>
  );
}

function RotacionTabla({
  titulo, subtitulo, icon: Icon, iconColor, rows, render, vacio,
}: {
  titulo: string; subtitulo: string; icon: typeof PackageX; iconColor: string;
  rows: ProductAnalytics[]; render: (p: ProductAnalytics) => { izq: string; der: string; sub: string }; vacio: string;
}) {
  return (
    <div className="bg-white border border-cream-dark rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h2 className="font-title font-extrabold text-chocolate">{titulo}</h2>
      </div>
      <p className="text-xs text-chocolate-light mb-3">{subtitulo}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-chocolate-light py-4 text-center">{vacio}</p>
      ) : (
        <div className="divide-y divide-cream-dark/60">
          {rows.map((p) => {
            const r = render(p);
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-chocolate truncate">{r.izq}</p>
                  <p className="text-[11px] text-chocolate-light">{r.sub}</p>
                </div>
                <span className="text-sm font-black text-chocolate whitespace-nowrap">{r.der}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
