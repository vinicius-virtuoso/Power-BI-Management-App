import { UsersRepository } from "../repositories/users/UsersRepository";

export class GetAllUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}
  async execute() {
    return await this.usersRepository.getAllUsers();
  }
}
