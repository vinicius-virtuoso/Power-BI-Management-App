import { AppError } from "@/core/domain/errors/AppError";
import { toast } from "sonner";

export const handleGlobalError = (error: unknown) => {
  // 1. Erros conhecidos da nossa aplicação (AppError)
  if (error instanceof AppError) {
    const status = error.statusCode;
    const message = error.message;

    if (status === 401 && message !== "Invalids credentials") {
      toast.error("Sessão expirada", {
        description: "Por favor, faça login novamente.",
      });
    } else if (status === 401 && message === "Invalids credentials") {
      toast.error("Credenciais inválidas", {
        description: "Por favor, verifique se o email ou senha está correto",
      });
    } else if (status === 403) {
      toast.error("Acesso negado", {
        description: "Você não tem permissão para realizar esta ação.",
      });
    } else if (status === 404) {
      toast.error("Não encontrado", {
        description: "O recurso solicitado não existe.",
      });
    } else if (status === 409) {
      toast.warning("Ocorreu um conflito", {
        description: "O recurso solicitado já existe.",
      });
    } else if (status === 500) {
      toast.error("Erro no servidor", {
        description: "Ocorreu uma falha interna. Tente novamente mais tarde.",
      });
    } else {
      toast.error("Ops!", {
        description: error.message || "Ocorreu um erro inesperado.",
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
