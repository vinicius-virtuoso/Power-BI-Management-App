import { apiFetch } from "@/core/data/apiFetch";
import { AppError } from "@/core/domain/errors/AppError";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ updateUserId: string }> },
) {
  const { updateUserId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  // 1. Bloqueio preventivo no BFF
  if (!token) {
    return NextResponse.json(
      { message: "Não autorizado", statusCode: 401 },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    // Construção do payload (mantendo sua lógica de senha opcional)
    const updatePayload: any = {
      name: body.name,
      email: body.email,
    };

    if (body.password && body.password.trim() !== "") {
      updatePayload.password = body.password;
    }

    // 2. Chamada ao backend real via apiFetch
    const data = await apiFetch(
      `${process.env.API_URL}/users/${updateUserId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      },
    );

    // 3. Retorno de sucesso
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
    console.error(`[PATCH_USER_ERROR] ID: ${updateUserId}:`, error);
    return NextResponse.json(
      { message: "Erro inesperado ao atualizar usuário", statusCode: 500 },
      { status: 500 },
    );
  }
}
