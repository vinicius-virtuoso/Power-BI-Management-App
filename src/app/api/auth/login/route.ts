import { apiFetch } from "@/core/data/apiFetch";
import { AppError } from "@/core/domain/errors/AppError";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthResponse {
  access_token: string;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. O apiFetch substitui todos os IFs de status (400, 401, 500)
    // Se o backend retornar erro, ele lança o AppError com a mensagem real
    const data = await apiFetch<AuthResponse>(
      `${process.env.API_URL}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );

    // 2. SALVANDO O TOKEN NO COOKIE HTTPONLY (Só chegamos aqui se o status for 2xx)
    const cookieStore = await cookies();

    cookieStore.set("session_token", data.access_token, {
      httpOnly: true,
      secure: false, // Desativado até você ter um domínio e SSL configurados
      sameSite: "lax", // Recomendo mudar para lax para evitar problemas de roteamento
      path: "/",
      maxAge: 60 * 60 * 24 * 3, // 3 dias
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // 3. Tratamento de erro padronizado
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message, statusCode: error.statusCode },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { message: "Erro inesperado ao realizar login", statusCode: 500 },
      { status: 500 },
    );
  }
}
