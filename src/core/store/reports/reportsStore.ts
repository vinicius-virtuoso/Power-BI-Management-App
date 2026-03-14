import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { create } from "zustand";

interface ReportsState {
  isLoadingReports: boolean;
  setIsLoadingReports: (loading: boolean) => void; // Adicionado à interface
  reportsList: { total: number; reports: ReportProps[] };
  setReports: (reports: ListReports) => void;
  clearReports: () => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  isLoadingReports: false,
  setIsLoadingReports: (loading: boolean) => set({ isLoadingReports: loading }),
  reportsList: { total: 0, reports: [] },
  setReports: (reportsList) => set({ reportsList, isLoadingReports: false }),
  clearReports: () =>
    set({ reportsList: { total: 0, reports: [] }, isLoadingReports: false }),
}));
