import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";
import { UserProps } from "@/core/domain/entities/user";
import { GetProfileUseCase } from "@/core/domain/use-cases/GetProfileUseCase";
import { handleGlobalError } from "@/presentation/utils/errorHandler"; // Importante para o Toast
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: UserProps | null;
  isLoading: boolean;
  setUser: (user: UserProps) => void;
  fetchUserMe: () => Promise<void>;
  clearUser: () => void;
}

const repo = new ApiUsersRepository();

export const useUserMeStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      fetchUserMe: async () => {
        if (get().isLoading) return;

        set({ isLoading: true });

        try {
          const useCase = new GetProfileUseCase(repo);
          const userData = await useCase.execute();

          set({ user: userData });
        } catch (error: unknown) {
          set({ user: null });

          handleGlobalError(error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-data",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
