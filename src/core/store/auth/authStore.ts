import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        set({ isAuthenticated: false });
        window.location.href = "/login";
      },
    }),
    { name: "auth-session" }, // Salva no LocalStorage
  ),
);
