"use client";
import { ApiAuthRepository } from "@/core/data/repositories/ApiAuthRepository";
// presentation/hooks/useLoginController.ts
import { LoginFormData } from "@/core/domain/schemas/loginSchema";
import { LoginUseCase } from "@/core/domain/use-cases/LoginUseCase";
import { useAuthStore } from "@/core/store/authStore";
import { useState } from "react";

// presentation/hooks/useLoginController.ts
export function useLoginController() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated); // Ajuste no Zustand

  const repo = new ApiAuthRepository();
  const loginUseCase = new LoginUseCase(repo);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const success = await loginUseCase.execute(data.email, data.password);

      if (success) {
        // Se a API só manda o token, você marca como logado no Zustand
        // e opcionalmente redireciona para o Dashboard
        setAuthenticated(true);
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, errorMessage, isLoading };
}
