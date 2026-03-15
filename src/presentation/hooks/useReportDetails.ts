import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ReportProps } from "@/core/domain/entities/report";
import { GetReportByIdUseCase } from "@/core/domain/use-cases/GetReportByIdUseCase";
import { useCallback, useEffect, useRef, useState } from "react";

export function useReportDetails() {
  const [report, setReport] = useState<ReportProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentReportIdRef = useRef<string | null>(null);

  const repository = new ApiReportsRepository();
  const getReportByIdUseCase = new GetReportByIdUseCase(repository);

  const loadReport = useCallback(
    async (reportId: string, isRefresh = false) => {
      if (!reportId) return;

      // PROTEÇÃO 1: Se já carregamos ESSE ID e temos os dados, ignora
      if (!isRefresh && currentReportIdRef.current === reportId && report)
        return;

      // PROTEÇÃO 2: Se já existe uma requisição VOANDO para esse mesmo ID, bloqueia a segunda
      if (isLoading && currentReportIdRef.current === reportId) return;

      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

      try {
        if (!isRefresh) setIsLoading(true);
        setError(null);

        // PROTEÇÃO 3: Marcamos o ID atual antes do await para bloquear disparos simultâneos
        currentReportIdRef.current = reportId;

        const data = await getReportByIdUseCase.execute(reportId);

        setReport(data);

        refreshTimerRef.current = setTimeout(
          () => {
            loadReport(reportId, true);
          },
          50 * 60 * 1000,
        );
      } catch (err: any) {
        // Se der erro, limpamos a ref para permitir tentar carregar de novo
        currentReportIdRef.current = null;
        setError(err.message || "Erro ao carregar");
      } finally {
        setIsLoading(false);
      }
    },
    [report, isLoading], // Agora precisamos dessas dependências para as proteções lerem os valores atuais
  );

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const clearReport = () => {
    currentReportIdRef.current = null;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setReport(null);
  };

  return {
    report,
    isLoading,
    error,
    loadReport,
    clearReport,
  };
}
