import { AppError } from "../domain/errors/AppError";

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  // Tenta parsear o JSON, mas trata se o corpo vier vazio
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Aqui injetamos a lógica de status que o seu backend envia
    throw new AppError(
      data.message || "Erro inesperado no servidor",
      data.statusCode || response.status,
    );
  }

  return data as T;
}
