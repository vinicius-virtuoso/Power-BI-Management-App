import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { CreateUserUseCase } from "@/core/domain/use-cases/CreateUserUseCase";
import { useUsersStore } from "@/core/store/users/useUsersStore";
import { useCallback } from "react";

export function useUsers() {
  const usersData = useUsersStore((state) => state.usersData);
  const isLoading = useUsersStore((state) => state.isLoading);
  const error = useUsersStore((state) => state.error);

  const fetchUsers = useUsersStore((state) => state.fetchUsers);
  const removeUserFromList = useUsersStore((state) => state.removeUserFromList);

  // Usamos useCallback para que a função seja estável e não cause re-renders infinitos em useEffects
  const createUser = useCallback(
    async (data: any) => {
      const repository = new ApiUsersRepository();
      const useCase = new CreateUserUseCase(repository);

      try {
        const newUser = await useCase.execute(data);
        // Após criar, precisamos atualizar a lista global
        await fetchUsers();
        return newUser;
      } catch (error) {
        throw error;
      }
    },
    [fetchUsers],
  );

  const userUpdate = useCallback(
    async (userId: string, data: any) => {
      const repository = new ApiUsersRepository();
      try {
        const updatedUser = await repository.userUpdate(userId, data);
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
    isLoading,
    error,
    fetchUsers,
    removeUserFromList,
    createUser,
    userUpdate,
  };
}
