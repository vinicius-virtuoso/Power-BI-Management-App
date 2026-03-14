import { AuthRepository } from "../repositories/AuthRepository";

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string) {
    if (!email.includes("@")) throw new Error("Email inválido");
    return await this.authRepository.login(email, password);
  }
}
