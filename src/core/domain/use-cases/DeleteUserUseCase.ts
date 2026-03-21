import { UsersRepository } from "../repositories/users/UsersRepository";

export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(userId: string) {
    return await this.usersRepository.deleteUser(userId);
  }
}
