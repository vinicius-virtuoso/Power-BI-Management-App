import "dotenv/config";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

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
}
