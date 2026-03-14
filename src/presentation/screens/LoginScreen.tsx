"use client";

import { useAuthStore } from "@/core/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "../components/LoginForm";
import { useLoginController } from "../hooks/useLoginController";

export function LoginScreen() {
  const { handleLogin, isLoading, errorMessage } = useLoginController();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Exemplo de uso do Zustand: se logou, redireciona
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard"); // Ou a rota que preferir
    }
  }, [isAuthenticated, router]);

  return (
    <main className="container-centralizado">
      <section className="p-8 bg-card rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Bem-vindo de volta</h1>

        {/* Passamos o isLoading para o formulário controlar os estados internos dos botões */}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        {/* Feedbacks globais (erros que vêm do servidor/Use Case) */}
        <div className="mt-4 min-h-[24px]">
          {isLoading && (
            <p className="text-blue-500 animate-pulse">
              Verificando credenciais...
            </p>
          )}
          {errorMessage && (
            <span className="text-red-500 text-sm font-medium">
              {errorMessage}
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
