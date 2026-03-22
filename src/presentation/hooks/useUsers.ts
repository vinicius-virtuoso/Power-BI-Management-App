import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { ActivateUserUseCase } from "@/core/domain/use-cases/ActivateUserUseCase";
import { CreateUserUseCase } from "@/core/domain/use-cases/CreateUserUseCase";
import { DeactivateUserUseCase } from "@/core/domain/use-cases/DeactivateUserUseCase";
import { DeleteUserUseCase } from "@/core/domain/use-cases/DeleteUserUseCase";
import { UpdateUserUseCase } from "@/core/domain/use-cases/UpdateUserUseCase";
import { useUsersStore } from "@/core/store/users/useUsersStore";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAsync } from "./useAsync";

export function useUsers() {
  const usersData = useUsersStore((state) => state.usersData);
  const isLoading = useUsersStore((state) => state.isLoading);
  const error = useUsersStore((state) => state.error);

  const [isUpdating, setIsUpdating] = useState(false);
  const { setUser } = useUserMeStore();

  const fetchUsers = useUsersStore((state) => state.fetchUsers);
  const removeUserFromList = useUsersStore((state) => state.removeUserFromList);

  const { run, loading } = useAsync();

  // Usamos useCallback para que a função seja estável e não cause re-renders infinitos em useEffects
  const createUser = useCallback(
    async (data: any) => {
      const repository = new ApiUsersRepository();
      const useCase = new CreateUserUseCase(repository);

      // O 'run' executa, se der erro ele chama o toast e retorna null
      const result = await run(useCase.execute(data));

      if (result) {
        await fetchUsers(); // Só atualiza se deu certo
      }
      return result;
    },
    [fetchUsers, run],
  );

  const userUpdate = useCallback(
    async (
      userId: string,
      data: {
        name?: string;
        email?: string;
        password?: string;
        role?: "USER" | "ADMIN";
      },
    ) => {
      setIsUpdating(true);
      try {
        const repository = new ApiUsersRepository();
        const useCase = new UpdateUserUseCase(repository);
        const updatedUser = await run(useCase.execute(userId, data));
        await fetchUsers();
        toast.success("Perfil atualizado com sucesso!");
        return updatedUser;
      } catch (error: any) {
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUsers],
  );

  const userActivate = useCallback(
    async (userId: string, isCurrentlyActive: boolean) => {
      setIsUpdating(true);
      try {
        const repository = new ApiUsersRepository();
        const activateUseCase = new ActivateUserUseCase(repository);
        const deactivateUseCase = new DeactivateUserUseCase(repository);

        if (isCurrentlyActive) {
          await run(deactivateUseCase.execute(userId));
          toast.info("Usuário desativado com sucesso!");
        } else {
          await run(activateUseCase.execute(userId));
          toast.info("Usuário ativado com sucesso!");
        }

        await fetchUsers();
      } catch (error: any) {
        toast.error("Erro ao alterar status do usuário");
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUsers],
  );

  const userDelete = useCallback(
    async (userId: string) => {
      setIsUpdating(true);
      try {
        const repository = new ApiUsersRepository();
        const deleteUseCase = new DeleteUserUseCase(repository);

        await run(deleteUseCase.execute(userId));
        toast.success("Usuário excluído com sucesso!");

        await fetchUsers();
      } catch (error: any) {
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchUsers],
  );

  return {
    usersData,
    isLoading: loading,
    error,
    fetchUsers,
    createUser,
    userUpdate,
    isUpdating,
    userActivate,
    userDelete,
  };
}
