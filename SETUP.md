# Aruna · Puesta en marcha (Admin + POS + Tienda)

La web ya funciona en **modo demo** sin configuración (usa datos de ejemplo, los cambios no se
guardan, login con `admin` / `admin`). Para activar la persistencia real sigue estos pasos.

## 1. Crear el proyecto en Supabase
1. Entra a https://supabase.com → **New project**. Anota la contraseña de la base de datos.
2. Cuando esté listo, ve a **SQL Editor → New query**, pega TODO el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**. Esto crea las tablas, la función
   `create_order` y el bucket de imágenes.

## 2. Obtener las llaves
En tu proyecto Supabase → **Settings → API**:
- **Project URL** → `SUPABASE_URL`
- **service_role** (en *Project API keys*, secreta) → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Configurar variables de entorno
Copia `.env.example` como `.env.local` y rellena:

```
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # service_role
AUTH_SECRET=...                    # genera uno: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
ADMIN_USERNAME=tu_usuario
ADMIN_PASSWORD=tu_contraseña_segura
```

## 4. Sembrar admin y productos
```
npm run seed:admin      # crea el usuario admin (hash bcrypt) en la DB
npm run seed:products   # migra los 4 productos actuales + categoría a la DB
```

## 5. Probar en local
```
npm run dev
```
- Tienda: http://localhost:3000
- Admin:  http://localhost:3000/admin  (entra con ADMIN_USERNAME / ADMIN_PASSWORD)

Verifica: crear/editar producto con imágenes, crear categoría, hacer un pedido en la tienda
(aparece en **/admin/pedidos**), y registrar una venta en **/admin/pos** (descuenta stock).

## 6. Desplegar en Vercel
1. Sube el repo a GitHub.
2. En https://vercel.com → **New Project** → importa el repo.
3. En **Settings → Environment Variables** añade las mismas 5 variables del `.env.local`.
4. Deploy. (El `seed:admin`/`seed:products` se ejecutan una sola vez desde tu máquina apuntando a
   la misma DB de Supabase; no hace falta repetirlos en Vercel.)

## 7. (Opcional) Pasarela de pago Wompi
Pendiente de fase posterior: crear cuenta de comercio Wompi, añadir `WOMPI_PUBLIC_KEY`,
`WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET` y conectar el webhook para marcar pedidos `pagado`
automáticamente. Hoy los pedidos quedan en `pendiente` y se cobran de forma manual desde el admin.

---
### Notas
- La `service_role` key es **secreta**: nunca la expongas en el navegador ni la subas a git
  (`.env.local` ya está en `.gitignore`).
- Mientras no configures Supabase, la tienda sigue mostrando los productos de ejemplo y el checkout
  genera un número de pedido simulado (no se guarda).
