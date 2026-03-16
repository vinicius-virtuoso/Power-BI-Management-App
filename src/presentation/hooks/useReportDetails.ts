import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useCallback, useEffect, useRef } from "react";

export function useReportDetails(reportId?: string) {
  const { reportDetails, isLoadingDetails, fetchReportDetails } =
    useReportsStore();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Pegamos o relatório do cache global
  const report = reportId ? reportDetails[reportId] : null;

  // 2. Ajuste na função loadReport
  const loadReport = useCallback(
    async (id: string, isRefresh = false) => {
      if (!id) return;

      // Chama a store (que já tem a trava de isLoading e Cache)
      await fetchReportDetails(id);

      // Gerencia o Refresh do Token (Power BI expira)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

      refreshTimerRef.current = setTimeout(
        () => {
          // Usamos uma chamada recursiva simples aqui
          loadReport(id, true);
        },
        50 * 60 * 1000,
      ); // 50 min
    },
    [fetchReportDetails], // Dependência estável da store
  );

  // 3. Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return {
    report,
    isLoading: isLoadingDetails,
    loadReport,
  };
}
