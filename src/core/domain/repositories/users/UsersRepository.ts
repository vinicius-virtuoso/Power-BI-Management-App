import { User } from "../../entities/user";

export interface UsersRepository {
  getMe(): Promise<User>;
  userUpdate(
    userId: string,
    data: {
      name?: string;
      password?: string;
      email?: string;
    },
  ): Promise<User>;
  getAllUsers(): Promise<{
    total: number;
    users: User[];
  }>;
  creteUser(data: {
    name: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN";
  }): Promise<User>;
}
