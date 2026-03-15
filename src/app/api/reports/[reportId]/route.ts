import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  // Mudamos a tipagem para refletir que params é uma Promise
  { params }: { params: Promise<{ reportId: string }> },
) {
  // 1. O segredo está aqui: você PRECISA dar await no params
  const { reportId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.API_URL}/reports/${reportId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Erro ao buscar relatório na API externa" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
