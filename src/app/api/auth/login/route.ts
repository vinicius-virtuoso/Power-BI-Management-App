import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthResponse {
  access_token: string;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 400) {
      return NextResponse.json(
        { message: "Dados de entrada mal formatados" },
        { status: 400 },
      );
    }

    if (response.status === 401) {
      return NextResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    if (response.status === 500) {
      return NextResponse.json(
        { message: "Erro de conexão com o servidor" },
        { status: 500 },
      );
    }

    const data: AuthResponse = await response.json();

    // SALVANDO O TOKEN NO COOKIE HTTPONLY
    const cookieStore = await cookies();
    cookieStore.set("session_token", data.access_token, {
      httpOnly: true, // O JavaScript não pode ler
      secure: process.env.NODE_ENV === "production", // Só via HTTPS em produção
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 3,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
