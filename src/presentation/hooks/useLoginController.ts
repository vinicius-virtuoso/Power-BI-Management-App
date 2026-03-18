"use client";
import { ApiAuthRepository } from "@/core/data/repositories/auth/ApiAuthRepository";
import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { LoginFormDataType } from "@/core/domain/schemas/loginSchema";
import { GetProfileUseCase } from "@/core/domain/use-cases/GetProfileUseCase";
import { LoginUseCase } from "@/core/domain/use-cases/LoginUseCase";
import { useAuthStore } from "@/core/store/auth/authStore";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { handleGlobalError } from "@/presentation/utils/errorHandler"; // Importe seu handler
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner"; // Ou sua lib de toast

export function useLoginController() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const logoutAuth = useAuthStore((state) => state.logout);
  const setUser = useUserMeStore((state) => state.setUser);
  const clearUser = useUserMeStore((state) => state.clearUser);

  const authRepo = new ApiAuthRepository();
  const loginUseCase = new LoginUseCase(authRepo);
  const usersRepo = new ApiUsersRepository();
  const getProfileUseCase = new GetProfileUseCase(usersRepo);

  const handleLogin = async (data: LoginFormDataType) => {
    setIsLoading(true);

    try {
      clearUser();
      setAuthenticated(false);

      const success = await loginUseCase.execute(data.email, data.password);

      if (success) {
        const userData = await getProfileUseCase.execute();
        setUser(userData);
        setAuthenticated(true);
        toast.success(`Bem-vindo, ${userData.name || "de volta"}!`);
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      handleGlobalError(error);
      setAuthenticated(false);
      clearUser();
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
}
