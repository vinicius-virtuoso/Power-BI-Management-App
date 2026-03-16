import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.API_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.status === 401) {
      return NextResponse.json(
        { message: "Sessão expirada ou inválida" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
