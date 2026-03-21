import { UsersRepository } from "../repositories/users/UsersRepository";

export class ActivateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(userId: string) {
    return await this.usersRepository.activateUser(userId);
  }
}
