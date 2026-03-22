import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import { handleGlobalError } from "@/presentation/utils/errorHandler";
import { create } from "zustand";

const CACHE_TTL_MS = 30_000; // 30 segundos

const repository = new ApiReportsRepository();

interface ReportsState {
  isLoadingReports: boolean;
  reportsList: { total: number; reports: ReportProps[] };
  lastFetchedAt: Record<string, number>; // userId → timestamp
  fetchReports: (userId: string, force?: boolean) => Promise<void>;
  invalidateCache: (userId?: string) => void;
  setReports: (reports: ListReports) => void;
  clearReports: () => void;

  isLoadingDetails: boolean;
  reportDetails: Record<string, any>;
  fetchReportDetails: (id: string) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  isLoadingReports: false,
  reportsList: { total: 0, reports: [] },
  lastFetchedAt: {},
  isLoadingDetails: false,
  reportDetails: {},

  fetchReports: async (userId: string, force = false) => {
    const { isLoadingReports, lastFetchedAt } = get();

    // Evita chamadas duplicadas
    if (isLoadingReports) return;

    // Retorna cache se ainda estiver dentro do TTL (a menos que force=true)
    if (!force && lastFetchedAt[userId] !== undefined) {
      const age = Date.now() - lastFetchedAt[userId];
      if (age < CACHE_TTL_MS) return;
    }

    set({ isLoadingReports: true });

    try {
      const useCase = new GetAllReportsUseCase(repository);
      const data = await useCase.execute(userId);

      set((state) => ({
        reportsList: data,
        lastFetchedAt: {
          ...state.lastFetchedAt,
          [userId]: Date.now(), // registra por userId — admin e user têm caches separados
        },
      }));
    } catch (error) {
      throw error;
    } finally {
      set({ isLoadingReports: false });
    }
  },

  // Invalida o cache de um userId específico ou de todos se não passar argumento
  // Use após sincronizar, ativar/desativar ou excluir relatórios
  invalidateCache: (userId?: string) =>
    set((state) => ({
      lastFetchedAt: userId ? { ...state.lastFetchedAt, [userId]: 0 } : {},
    })),

  fetchReportDetails: async (id: string) => {
    if (get().isLoadingDetails || get().reportDetails[id]) return;

    set({ isLoadingDetails: true });

    try {
      const data = await repository.getReportById(id);

      set((state) => ({
        reportDetails: {
          ...state.reportDetails,
          [id]: data,
        },
      }));
    } catch (error) {
      handleGlobalError(error);
      throw error;
    } finally {
      set({ isLoadingDetails: false });
    }
  },

  setReports: (reportsList) => set({ reportsList, isLoadingReports: false }),

  clearReports: () =>
    set({
      reportsList: { total: 0, reports: [] },
      reportDetails: {},
      lastFetchedAt: {},
      isLoadingReports: false,
      isLoadingDetails: false,
    }),
}));
