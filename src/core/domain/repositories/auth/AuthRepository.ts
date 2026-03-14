import { User } from "../../entities/user";

export interface AuthRepository {
  login(email: string, password: string): Promise<boolean>;
  getMe(): Promise<User>;
}
