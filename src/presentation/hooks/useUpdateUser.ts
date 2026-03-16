import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { UpdateUserUseCase } from "@/core/domain/use-cases/UpdateUserUseCase";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { useState } from "react";
import { toast } from "sonner";

export function useUpdateUser() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setUser } = useUserMeStore();

  const updateUser = async (
    userId: string,
    data: { name?: string; email?: string; password?: string },
  ) => {
    setIsUpdating(true);
    try {
      const repository = new ApiUsersRepository();
      const useCase = new UpdateUserUseCase(repository);

      const updatedUser = await useCase.execute(userId, data);

      setUser(updatedUser);

      toast.success("Perfil atualizado com sucesso!");
      return updatedUser;
    } catch (error: any) {
      toast.error(error.message || "Falha ao atualizar perfil");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateUser,
    isUpdating,
  };
}
