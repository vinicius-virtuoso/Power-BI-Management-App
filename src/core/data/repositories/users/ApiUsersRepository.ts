import { User } from "@/core/domain/entities/user";
import { UsersRepository } from "@/core/domain/repositories/users/UsersRepository";

interface GetUsersResponse {
  total: number;
  users: User[];
}

export class ApiUsersRepository implements UsersRepository {
  async creteUser(data: {
    name: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN";
  }): Promise<User> {
    const response = await fetch(`/api/users/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erro ao atualizar usuário");
    }

    return result;
  }

  async userUpdate(
    userId: string,
    data: {
      name?: string;
      password?: string;
      email?: string;
    },
  ): Promise<User> {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Erro ao atualizar usuário");
    }

    return result;
  }

  async getMe(): Promise<User> {
    const response = await fetch("/api/users/me");

    if (!response.ok) {
      throw new Error("Sessão expirada ou inválida");
    }

    return response.json();
  }

  async getAllUsers(): Promise<GetUsersResponse> {
    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("Erro ao buscar usuários");
    }

    return response.json();
  }
}
