import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Se o usuário está no Login mas JÁ TEM TOKEN, manda direto pro Dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se o usuário tenta acessar o Dashboard mas NÃO TEM TOKEN, manda pro Login
  if (request.nextUrl.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configura em quais rotas o middleware deve agir
export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
