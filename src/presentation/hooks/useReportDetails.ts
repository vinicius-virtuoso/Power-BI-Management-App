import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useCallback, useEffect, useRef } from "react";

// @/presentation/hooks/useReportDetails.ts

export function useReportDetails(reportId?: string) {
  const { reportDetails, isLoadingDetails, fetchReportDetails } =
    useReportsStore();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const report = reportId ? reportDetails[reportId] : null;

  const loadReport = useCallback(
    async (id: string) => {
      if (!id) return;

      try {
        await fetchReportDetails(id);

        // REFRESH LOGIC
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

        refreshTimerRef.current = setTimeout(
          () => {
            loadReport(id); // Tenta renovar o token
          },
          50 * 60 * 1000,
        ); // 50 min
      } catch (error: any) {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        throw error;
      }
    },
    [fetchReportDetails],
  );

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  return { report, isLoading: isLoadingDetails, loadReport };
}
