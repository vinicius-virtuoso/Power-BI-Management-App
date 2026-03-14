import { AuthRepository } from "../repositories/auth/AuthRepository";

export class GetProfileUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute() {
    return await this.authRepository.getMe();
  }
}
