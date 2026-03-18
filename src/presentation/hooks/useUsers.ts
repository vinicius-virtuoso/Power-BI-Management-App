import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { CreateUserUseCase } from "@/core/domain/use-cases/CreateUserUseCase";
import { UpdateUserUseCase } from "@/core/domain/use-cases/UpdateUserUseCase";
import { useUsersStore } from "@/core/store/users/useUsersStore";
import { useCallback } from "react";
import { useAsync } from "./useAsync";

export function useUsers() {
  const usersData = useUsersStore((state) => state.usersData);
  const isLoading = useUsersStore((state) => state.isLoading);
  const error = useUsersStore((state) => state.error);

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
    async (userId: string, data: any) => {
      const repository = new ApiUsersRepository();
      const useCase = new UpdateUserUseCase(repository);
      try {
        const updatedUser = await run(useCase.execute(userId, data));
        await fetchUsers();
        return updatedUser;
      } catch (error) {
        throw error;
      }
    },
    [fetchUsers],
  );

  return {
    usersData,
    isLoading: loading,
    error,
    fetchUsers,
    removeUserFromList,
    createUser,
    userUpdate,
  };
}
