import { User } from "@/core/domain/entities/user";
import { AuthRepository } from "../../../domain/repositories/auth/AuthRepository";

export class ApiAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<boolean> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro no login");
    }

    return true; // Login realizado com sucesso
  }

  async getMe(): Promise<User> {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      throw new Error("Sessão expirada ou inválida");
    }

    return response.json();
  }
}
