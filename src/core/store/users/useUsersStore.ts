import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { UserProps } from "@/core/domain/entities/user";
import { GetAllUsersUseCase } from "@/core/domain/use-cases/GetAllUsersUseCase";
import { handleGlobalError } from "@/presentation/utils/errorHandler";
import { create } from "zustand";

const CACHE_TTL_MS = 30_000; // 30 segundos

interface UserState {
  usersData: { total: number; users: UserProps[] };
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null; // timestamp do último fetch bem-sucedido

  fetchUsers: (force?: boolean) => Promise<void>;
  setUsersData: (data: { total: number; users: UserProps[] }) => void;
  updateUserInList: (userId: string, data: Partial<UserProps>) => void;
  removeUserFromList: (userId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  invalidateCache: () => void;
}

const repository = new ApiUsersRepository();

export const useUsersStore = create<UserState>((set, get) => ({
  usersData: { total: 0, users: [] },
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchUsers: async (force = false) => {
    const { isLoading, lastFetchedAt } = get();

    // Evita chamadas duplicadas se já estiver carregando
    if (isLoading) return;

    // Retorna cache se ainda estiver dentro do TTL (a menos que force=true)
    if (!force && lastFetchedAt !== null) {
      const age = Date.now() - lastFetchedAt;
      if (age < CACHE_TTL_MS) return;
    }

    set({ isLoading: true });

    try {
      const useCase = new GetAllUsersUseCase(repository);
      const data = await useCase.execute();

      set({
        usersData: data,
        error: null,
        lastFetchedAt: Date.now(), // registra o momento do fetch
      });
    } catch (err: any) {
      set({ error: err.message });
      handleGlobalError(err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Força o próximo fetchUsers a rebuscar independente do TTL
  // Use após criar, editar ou excluir usuários
  invalidateCache: () => set({ lastFetchedAt: null }),

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
