"use client";
import { ApiAuthRepository } from "@/core/data/repositories/auth/ApiAuthRepository";
import { LoginFormData } from "@/core/domain/schemas/loginSchema";
import { GetProfileUseCase } from "@/core/domain/use-cases/GetProfileUseCase"; // Novo Use Case
import { LoginUseCase } from "@/core/domain/use-cases/LoginUseCase";
import { useAuthStore } from "@/core/store/auth/authStore";
import { useUsersMeStore } from "@/core/store/users/userMeStore"; // Store separada de usuário
import { useRouter } from "next/navigation"; // Importado para redirecionar após o sucesso
import { useState } from "react";

export function useLoginController() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUser = useUsersMeStore((state) => state.setUser);

  const repo = new ApiAuthRepository();
  const loginUseCase = new LoginUseCase(repo);
  const getProfileUseCase = new GetProfileUseCase(repo);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const success = await loginUseCase.execute(data.email, data.password);

      if (success) {
        const userData = await getProfileUseCase.execute();
        setUser(userData);
        setAuthenticated(true);
        router.push("/dashboard");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Erro ao realizar autenticação");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, errorMessage, isLoading };
}
