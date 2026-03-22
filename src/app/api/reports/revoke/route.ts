import { apiFetch } from "@/core/data/apiFetch";
import { AppError } from "@/core/domain/errors/AppError";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Não autorizado", statusCode: 401 },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    await apiFetch(`${process.env.API_URL}/reports/revoke`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message, statusCode: error.statusCode },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        message: "Erro inesperado ao revogar acesso ao relatório",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
