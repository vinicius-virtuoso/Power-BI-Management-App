import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { create } from "zustand";

interface ReportsState {
  reportsList: { total: number; reports: ReportProps[] };
  setReports: (reports: ListReports) => void;
  clearReports: () => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  reportsList: { total: 0, reports: [] },
  setReports: (reportsList) => set({ reportsList }),
  clearReports: () => set({ reportsList: { total: 0, reports: [] } }),
}));
