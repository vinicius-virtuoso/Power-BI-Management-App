import { User } from "@/core/domain/entities/user";
import type { UsersRepository } from "@/core/domain/repositories/users/UsersRepository";
import { apiFetch } from "../../apiFetch"; // Importe o utilitário

export class ApiUsersRepository implements UsersRepository {
  getAllUsers(): Promise<{ total: number; users: User[] }> {
    return apiFetch<{ total: number; users: User[] }>("/api/users");
  }

  async getMe(): Promise<User> {
    return apiFetch<User>("/api/users/me");
  }

  async userUpdate(userId: string, data: any): Promise<User> {
    return apiFetch<User>(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async creteUser(data: any): Promise<User> {
    return apiFetch<User>(`/api/users/add`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
