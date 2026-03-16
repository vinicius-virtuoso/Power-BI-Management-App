import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import { create } from "zustand";

// Instância única para evitar recriação de objetos
const repository = new ApiReportsRepository();

interface ReportsState {
  isLoadingReports: boolean;
  reportsList: { total: number; reports: ReportProps[] };
  fetchReports: () => Promise<void>;
  setReports: (reports: ListReports) => void;
  clearReports: () => void;

  isLoadingDetails: boolean; // Trava específica para o token do Power BI
  reportDetails: Record<string, any>; // Cache simples: { id_do_report: dados_do_token }
  fetchReportDetails: (id: string) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  isLoadingReports: false,
  reportsList: { total: 0, reports: [] },
  isLoadingDetails: false,
  reportDetails: {},

  fetchReports: async () => {
    // TRAVA DE SEGURANÇA: Se já estiver carregando, não faz nada
    if (get().isLoadingReports) return;

    set({ isLoadingReports: true });

    try {
      const useCase = new GetAllReportsUseCase(repository);
      const data = await useCase.execute();
      set({ reportsList: data });
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    } finally {
      set({ isLoadingReports: false });
    }
  },
  fetchReportDetails: async (id: string) => {
    // Se já temos o detalhe no cache ou se já está carregando, aborta
    if (get().isLoadingDetails || get().reportDetails[id]) return;

    set({ isLoadingDetails: true });
    try {
      // Substitua pela chamada real do seu UseCase de detalhes
      const repo = new ApiReportsRepository();
      const data = await repo.getReportById(id);

      set((state) => ({
        reportDetails: { ...state.reportDetails, [id]: data },
      }));
    } finally {
      set({ isLoadingDetails: false });
    }
  },
  setReports: (reportsList) => set({ reportsList, isLoadingReports: false }),
  clearReports: () =>
    set({ reportsList: { total: 0, reports: [] }, isLoadingReports: false }),
}));
