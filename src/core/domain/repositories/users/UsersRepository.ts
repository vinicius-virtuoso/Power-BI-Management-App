import { User } from "../../entities/user";

export interface UsersRepository {
  me(): Promise<User>;
}
