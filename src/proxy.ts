import { NextRequest, NextResponse } from "next/server";

// ─── Rotas que exigem role ADMIN ──────────────────────────────────────────────

const ADMIN_ROUTES = [
  "/dashboard/users-management",
  "/dashboard/reports-management", // ← novo
];

// ─── Decodifica o payload do JWT sem verificar a assinatura ──────────────────
// Seguro para uso no middleware pois a assinatura já é validada pelo backend
// a cada requisição às rotas de API.

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    // Edge Runtime não tem Buffer — usa atob com padding correto
    const padded = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  // Se está no login mas já tem token → redireciona para o dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se tenta acessar o dashboard sem token → redireciona para o login
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se tenta acessar uma rota de admin → verifica o role no payload do JWT
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute && token) {
    const payload = decodeJwtPayload(token);

    if (payload?.role !== "ADMIN") {
      // Usuário autenticado mas sem permissão → redireciona para o dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
