import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (antes "middleware") de Next.js 16.
 * Chequeo OPTIMISTA de presencia de cookie para gatear /admin/*.
 * La verificación REAL de la sesión ocurre en el layout protegido del admin
 * (verifySession) — defensa en profundidad.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login es público
  if (pathname === "/admin/login") return NextResponse.next();

  const hasCookie = request.cookies.has("aruna_admin");
  if (!hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
