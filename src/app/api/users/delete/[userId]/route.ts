import { apiFetch } from "@/core/data/apiFetch";
import { AppError } from "@/core/domain/errors/AppError";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Não autorizado", statusCode: 401 },
      { status: 401 },
    );
  }

  try {
    const data = await apiFetch(
      `${process.env.API_URL}/users/remove/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return NextResponse.json(data);
  } catch (error: unknown) {
    // 4. Tratamento de erro padronizado
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message, statusCode: error.statusCode },
        { status: error.statusCode },
      );
    }

    // Erros genéricos (ex: JSON malformado no body ou queda de conexão)
    console.error(`[PATCH_USER_ERROR] ID: ${userId}:`, error);
    return NextResponse.json(
      { message: "Erro inesperado ao atualizar usuário", statusCode: 500 },
      { status: 500 },
    );
  }
}
