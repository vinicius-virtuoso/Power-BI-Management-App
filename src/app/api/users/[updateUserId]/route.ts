import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ updateUserId: string }> },
) {
  const { updateUserId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const updatePayload: any = {
      name: body.name,
      email: body.email,
    };

    if (body.password && body.password.trim() !== "") {
      updatePayload.password = body.password;
    }

    const response = await fetch(
      `${process.env.API_URL}/users/${updateUserId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Erro ao atualizar usuário" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro na rota de update:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
