import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Busca o cookie que definimos na Route Handler de Login
  const token = request.cookies.get("session_token")?.value;
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !token) {
    // Se tentar acessar o dashboard sem cookie, volta pro login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Define em quais rotas o middleware deve rodar
export const config = {
  matcher: ["/dashboard/:path*"],
};
