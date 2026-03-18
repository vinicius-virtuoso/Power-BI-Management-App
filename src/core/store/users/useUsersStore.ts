import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { UserProps } from "@/core/domain/entities/user";
import { GetAllUsersUseCase } from "@/core/domain/use-cases/GetAllUsersUseCase";
import { handleGlobalError } from "@/presentation/utils/errorHandler"; // Importe seu tratador de erros
import { create } from "zustand";

interface UserState {
  usersData: { total: number; users: UserProps[] };
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  setUsersData: (data: { total: number; users: UserProps[] }) => void;
  updateUserInList: (userId: string, data: Partial<UserProps>) => void;
  removeUserFromList: (userId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const repository = new ApiUsersRepository();

export const useUsersStore = create<UserState>((set, get) => ({
  usersData: { total: 0, users: [] },
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    // Evita chamadas duplicadas se já estiver carregando
    if (get().isLoading) return;

    set({ isLoading: true });

    try {
      const useCase = new GetAllUsersUseCase(repository);
      const data = await useCase.execute(); // Executa diretamente sem o 'run'

      set({ usersData: data, error: null });
    } catch (err: any) {
      // 1. Atualiza o estado de erro da store
      set({ error: err.message });

      // 2. DISPARA O TOAST (A mágica acontece aqui)
      handleGlobalError(err);
    } finally {
      set({ isLoading: false });
    }
  },

  setUsersData: (data) => set({ usersData: data }),
  setLoading: (isLoading) => set({ isLoading }),

  removeUserFromList: (userId) =>
    set((state) => ({
      usersData: {
        total: Math.max(0, state.usersData.total - 1),
        users: state.usersData.users.filter((u) => u.id !== userId),
      },
    })),

  updateUserInList: (userId, data) =>
    set((state) => ({
      usersData: {
        ...state.usersData,
        users: state.usersData.users.map((u) =>
          u.id === userId ? { ...u, ...data } : u,
        ),
      },
    })),

  setError: (error) => set({ error }),
}));
