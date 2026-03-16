import { UsersRepository } from "../repositories/users/UsersRepository";

export class CreateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(data: {
    name: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN";
  }) {
    return await this.usersRepository.creteUser(data);
  }
}
