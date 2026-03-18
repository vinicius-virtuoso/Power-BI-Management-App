import { apiFetch } from "@/core/data/apiFetch";
import { AppError } from "@/core/domain/errors/AppError";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("session_token")?.value;

  try {
    const data = await apiFetch(`${process.env.API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    // Use unknown em vez de any

    if (error instanceof AppError) {
      // Aqui o TS sabe que 'error' tem message e statusCode
      return NextResponse.json(
        { message: error.message, statusCode: error.statusCode },
        { status: error.statusCode },
      );
    }

    // Se não for um AppError (ex: erro de sintaxe, erro de rede do fetch)
    return NextResponse.json(
      { message: "Erro inesperado", statusCode: 500 },
      { status: 500 },
    );
  }
}
