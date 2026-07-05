import { z } from "zod";

/**
 * Esquemas de validación centralizados (Zod) con topes máximos sensatos.
 * Validan FORMA y LÍMITES; NO reemplazan el cálculo de precios en la DB
 * (los precios de venta se siguen tomando de `products` en el RPC create_order).
 */

// Topes en pesos colombianos (COP) y unidades.
export const MAX_MONEY = 100_000_000; // 100 millones COP
export const MAX_STOCK = 100_000;
export const MAX_QTY_ONLINE = 100;
export const MAX_QTY_POS = 10_000;

export const SIMBOLOS = ["colibri", "flamenco", "cardenal", "cactus", "lirios", "delfines"] as const;
export const LINEAS = ["mochilas", "maquillaje"] as const;

const money = z.number().int().min(0).max(MAX_MONEY);
const shortText = z.string().trim().max(120);
const longText = z.string().trim().max(2000);

// ------------------------------------------------------------
// Checkout online: POST /api/orders
// ------------------------------------------------------------
export const orderBodySchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1).max(80),
        cantidad: z.coerce.number().int().min(1).max(MAX_QTY_ONLINE),
      })
    )
    .min(1)
    .max(50),
  metodoPago: shortText.nullish(),
  notas: longText.nullish(),
  cliente: z
    .object({
      nombre: shortText.nullish(),
      telefono: shortText.nullish(),
      email: z.string().trim().email().max(160).nullish().or(z.literal("")),
      cedula: shortText.nullish(),
      ciudad: shortText.nullish(),
      departamento: shortText.nullish(),
      direccion: shortText.nullish(),
    })
    .nullish(),
});
export type OrderBody = z.infer<typeof orderBodySchema>;

// ------------------------------------------------------------
// POS / edición de pedidos: ítems con override de precio + descuento
// ------------------------------------------------------------
export const posItemSchema = z.object({
  product_id: z.string().min(1).max(80),
  cantidad: z.coerce.number().int().min(1).max(MAX_QTY_POS),
  precio_unitario: z.coerce.number().int().min(0).max(MAX_MONEY).optional(),
});

export const posSaleSchema = z.object({
  items: z.array(posItemSchema).min(1).max(200),
  metodoPago: shortText,
  descuento: z.coerce.number().int().min(0).max(MAX_MONEY).optional(),
});

export const orderEditSchema = z.object({
  id: z.string().min(1).max(40),
  estado: z.enum(["pendiente", "pagado", "enviado", "cancelado"]),
  metodoPago: shortText.nullish(),
  notas: longText.nullish(),
  descuento: z.coerce.number().int().min(0).max(MAX_MONEY).optional(),
  items: z.array(posItemSchema).min(1).max(200),
});

// ------------------------------------------------------------
// Producto (admin): valores numéricos/enum del formulario
// ------------------------------------------------------------
export const productSchema = z.object({
  nombre: z.string().trim().min(1).max(160),
  precio: money,
  costo: money,
  precio_anterior: money.nullable(),
  stock: z.number().int().min(0).max(MAX_STOCK),
  simbolo: z.enum(SIMBOLOS),
  linea: z.enum(LINEAS),
});

// ------------------------------------------------------------
// Pedido de proveedor (JSON `payload`)
// ------------------------------------------------------------
export const purchaseItemSchema = z.object({
  product_id: z.string().max(80).optional(),
  is_new: z.boolean().optional(),
  nombre: z.string().trim().max(160).optional(),
  referencia: z.string().trim().max(80).optional(),
  cantidad: z.coerce.number().int().min(0).max(MAX_STOCK),
  costo_unitario: z.coerce.number().int().min(0).max(MAX_MONEY),
  precio_venta: z.coerce.number().int().min(0).max(MAX_MONEY),
  categoria_id: z.string().max(80).nullish(),
  simbolo: z.string().max(40).optional(),
});

export const purchasePayloadSchema = z.object({
  proveedor: z.string().trim().max(160).optional(),
  fecha: z.string().max(40).optional(),
  costoEnvio: z.coerce.number().int().min(0).max(MAX_MONEY).optional(),
  notas: z.string().trim().max(2000).optional(),
  items: z.array(purchaseItemSchema).min(1).max(200),
});

// ------------------------------------------------------------
// Movimiento financiero (admin)
// ------------------------------------------------------------
export const movementSchema = z.object({
  tipo: z.enum(["inversion", "gasto", "ingreso"]),
  asunto: z.string().trim().min(1).max(160),
  descripcion: z.string().trim().max(2000).nullish(),
  monto: z.number().int().min(1).max(MAX_MONEY),
  fecha: z.string().max(40).nullish(),
});
