import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.localStorage.removeItem("user-data");
    set({ isAuthenticated: false });
  },
}));
