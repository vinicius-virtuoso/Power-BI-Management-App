import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Store persistida em sessionStorage.
 * Sobrevive a reloads na mesma aba — limpa ao fechar o browser.
 *
 * Set não é serializável em JSON, então armazenamos como string[]
 * e convertemos para Set na leitura.
 */

interface RefreshingState {
  // Armazenado como array para serialização JSON
  refreshingIds: string[];

  addRefreshing: (reportId: string) => void;
  removeRefreshing: (reportId: string) => void;
  isRefreshing: (reportId: string) => boolean;
}

export const useRefreshingStore = create<RefreshingState>()(
  persist(
    (set, get) => ({
      refreshingIds: [],

      addRefreshing: (reportId) =>
        set((state) => ({
          refreshingIds: state.refreshingIds.includes(reportId)
            ? state.refreshingIds
            : [...state.refreshingIds, reportId],
        })),

      removeRefreshing: (reportId) =>
        set((state) => ({
          refreshingIds: state.refreshingIds.filter((id) => id !== reportId),
        })),

      isRefreshing: (reportId) => get().refreshingIds.includes(reportId),
    }),
    {
      name: "refreshing-reports",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
