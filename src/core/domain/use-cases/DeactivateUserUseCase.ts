import { UsersRepository } from "../repositories/users/UsersRepository";

export class DeactivateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(userId: string) {
    return await this.usersRepository.deactivateUser(userId);
  }
}
