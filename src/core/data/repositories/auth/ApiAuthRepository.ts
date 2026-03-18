import { apiFetch } from "@/core/data/apiFetch";
import { AuthRepository } from "../../../domain/repositories/auth/AuthRepository";

export class ApiAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<boolean> {
    await apiFetch<{ success: boolean }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return true;
  }
}
