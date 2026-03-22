import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import { handleGlobalError } from "@/presentation/utils/errorHandler"; // Importante para o Toast
import { create } from "zustand";

// Instância única definida fora da store para performance
const repository = new ApiReportsRepository();

interface ReportsState {
  isLoadingReports: boolean;
  reportsList: { total: number; reports: ReportProps[] };
  fetchReports: (userId: string) => Promise<void>;
  setReports: (reports: ListReports) => void;
  clearReports: () => void;

  isLoadingDetails: boolean;
  reportDetails: Record<string, any>;
  fetchReportDetails: (id: string) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  isLoadingReports: false,
  reportsList: { total: 0, reports: [] },
  isLoadingDetails: false,
  reportDetails: {},

  fetchReports: async (userId: string) => {
    if (get().isLoadingReports) return;

    set({ isLoadingReports: true });

    try {
      const useCase = new GetAllReportsUseCase(repository);
      const data = await useCase.execute(userId);

      set({ reportsList: data });
    } catch (error) {
      // O handleGlobalError dispara o Toast (ex: "Sessão expirada" ou "Erro ao buscar relatórios")
      // handleGlobalError(error);
      throw error;
    } finally {
      set({ isLoadingReports: false });
    }
  },

  fetchReportDetails: async (id: string) => {
    // Cache check: se já temos os detalhes, não busca de novo
    if (get().isLoadingDetails || get().reportDetails[id]) return;

    set({ isLoadingDetails: true });

    try {
      // Usando a instância única 'repository' em vez de criar um 'new' aqui dentro
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
      reportDetails: {}, // Limpa o cache de detalhes também
      isLoadingReports: false,
      isLoadingDetails: false,
    }),
}));
