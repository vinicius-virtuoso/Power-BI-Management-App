import { UsersRepository } from "../repositories/users/UsersRepository";

export class UpdateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    userId: string,
    data: { name?: string; password?: string; email?: string },
  ) {
    return await this.usersRepository.userUpdate(userId, data);
  }
}
