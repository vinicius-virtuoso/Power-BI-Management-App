import {
  activateUserUseCase,
  createUserUseCase,
  deactivateUserUseCase,
  deleteUserUseCase,
  updateUserUseCase,
} from "@/core/container";
import { useUsersStore } from "@/core/store/users/useUsersStore";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAsync } from "./useAsync";

export function useUsers() {
  const usersData = useUsersStore((state) => state.usersData);
  const error = useUsersStore((state) => state.error);

  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useUsersStore((state) => state.fetchUsers);
  const updateUserInList = useUsersStore((state) => state.updateUserInList);

  const { run, loading } = useAsync();

  const createUser = useCallback(
    async (data: any) => {
      const result = await run(createUserUseCase.execute(data));
      if (result) {
        await fetchUsers();
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
        const updatedUser = await run(updateUserUseCase.execute(userId, data));
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
      updateUserInList(userId, { isActive: !isCurrentlyActive });

      try {
        if (isCurrentlyActive) {
          await run(deactivateUserUseCase.execute(userId));
          toast.info("Usuário desativado com sucesso!");
        } else {
          await run(activateUserUseCase.execute(userId));
          toast.info("Usuário ativado com sucesso!");
        }
      } catch (error: any) {
        updateUserInList(userId, { isActive: isCurrentlyActive });
        toast.error("Erro ao alterar status do usuário");
      } finally {
        setIsUpdating(false);
      }
    },
    [updateUserInList],
  );

  const userDelete = useCallback(
    async (userId: string) => {
      setIsUpdating(true);
      try {
        await run(deleteUserUseCase.execute(userId));
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
