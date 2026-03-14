"use client";

import { ApiAuthRepository } from "@/core/data/repositories/auth/ApiAuthRepository";
import { GetProfileUseCase } from "@/core/domain/use-cases/GetProfileUseCase";
import { useAuthStore } from "@/core/store/auth/authStore";
import { useUsersMeStore } from "@/core/store/users/userMeStore";
import { useEffect, useState } from "react"; // Adicione useState

export default function DashboardPage() {
  const { setAuthenticated } = useAuthStore();
  const { user, setUser, clearUser } = useUsersMeStore();
  const [isLoaded, setIsLoaded] = useState(false); // Controle de montagem

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const repo = new ApiAuthRepository();
        const useCase = new GetProfileUseCase(repo);
        const userData = await useCase.execute();

        setUser(userData);
        setAuthenticated(true);
      } catch (error) {
        clearUser();
        setAuthenticated(false);
        // Opcional: router.push('/login') aqui se quiser expulsar na hora
      } finally {
        setIsLoaded(true); // Finalizou a tentativa de carga
      }
    };

    if (!user) {
      loadProfile();
    } else {
      setIsLoaded(true); // Já tinha usuário no persist do Zustand
    }
  }, [user, setUser, setAuthenticated, clearUser]);

  // Enquanto o Next está "se encontrando" com o Zustand, mostramos um loading
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Olá, {user?.name}</h1>
      <p className="text-gray-600">E-mail: {user?.email}</p>
      {/* ...restante da UI */}
    </div>
  );
}
