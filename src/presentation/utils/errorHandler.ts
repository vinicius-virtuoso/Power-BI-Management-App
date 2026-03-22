import { AppError } from "@/core/domain/errors/AppError";
import { toast } from "sonner";

export const handleGlobalError = (error: unknown) => {
  // 1. Erros conhecidos da nossa aplicação (AppError)
  if (error instanceof AppError) {
    const status = error.statusCode;

    if (status === 400) {
      toast.error("Requisição inválida", {
        description: error.message,
      });
    } else if (status === 401) {
      toast.error("Falha de autenticação", {
        description: error.message,
      });
    } else if (status === 403) {
      toast.error("Acesso negado", {
        description: error.message,
      });
    } else if (status === 404) {
      toast.error("Não encontrado", {
        description: error.message,
      });
    } else if (status === 409) {
      toast.warning("Ocorreu um conflito", {
        description: error.message,
      });
    } else if (status === 500) {
      toast.error("Erro no servidor", {
        description: error.message,
      });
    } else {
      toast.error("Ops!", {
        description: error.message,
      });
    }

    return;
  }

  // 2. Erros genéricos (Rede, SyntaxError, etc.)
  console.error("Unhandled Error:", error);
  toast.error("Erro de conexão", {
    description: "Verifique sua internet ou tente novamente.",
  });
};
