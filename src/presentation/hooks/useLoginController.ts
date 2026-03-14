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

  // Seletores das Stores
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUser = useUsersMeStore((state) => state.setUser);

  // Instâncias das camadas
  const repo = new ApiAuthRepository();
  const loginUseCase = new LoginUseCase(repo);
  const getProfileUseCase = new GetProfileUseCase(repo);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Executa o Login (O servidor do Next vai salvar o Cookie via Route Handler)
      const success = await loginUseCase.execute(data.email, data.password);

      if (success) {
        // 2. Imediatamente busca as informações do usuário logado
        // Como o Cookie 'session_token' já está no navegador, o fetch para /api/auth/me o enviará
        const userData = await getProfileUseCase.execute();

        // 3. Atualiza as stores separadas
        setUser(userData);
        setAuthenticated(true);

        // 4. Redireciona para o dashboard
        router.push("/dashboard");
      }
    } catch (e: any) {
      // Se o login falhar ou o /me der erro, capturamos aqui
      setErrorMessage(e.message || "Erro ao realizar autenticação");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, errorMessage, isLoading };
}
