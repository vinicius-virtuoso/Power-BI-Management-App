import { apiFetch } from "@/core/data/apiFetch";
import { AppError } from "@/core/domain/errors/AppError";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Não autorizado", statusCode: 401 },
      { status: 401 },
    );
  }

  try {
    const data = await apiFetch(`${process.env.API_URL}/reports/sync`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message, statusCode: error.statusCode },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: "Erro inesperado ao sincronizar relatórios", statusCode: 500 },
      { status: 500 },
    );
  }
}
