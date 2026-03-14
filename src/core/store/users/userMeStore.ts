import { UserProps } from "@/core/domain/entities/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: UserProps | null;
  setUser: (user: UserProps) => void;
  clearUser: () => void;
}

export const useUsersMeStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "user-data" }, // Salva os dados do perfil separadamente no LocalStorage
  ),
);
