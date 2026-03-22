import { ApiRefreshDatasetRepository } from "@/core/data/repositories/refresh/ApiRefreshDatasetRepository";
import { ApiReportsAdminRepository } from "@/core/data/repositories/reports/ApiReportsAdminRepository";
import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ApiScheduleReportsRepository } from "@/core/data/repositories/schedules/ApiScheduleReportsRepository";
import { ReportProps } from "@/core/domain/entities/report";
import { ScheduleReportProps } from "@/core/domain/entities/schedule";
import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import {
  ActivateReportUseCase,
  CheckRefreshStatusUseCase,
  DeactivateReportUseCase,
  DeleteReportUseCase,
  GetAllSchedulesUseCase,
  RefreshDatasetUseCase,
  SyncReportsUseCase,
} from "@/core/domain/use-cases/ReportsManagementUseCases";
import { useRefreshingStore } from "@/core/store/reports/refreshingStore";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { handleGlobalError } from "@/presentation/utils/errorHandler";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Instâncias únicas ────────────────────────────────────────────────────────

const reportsRepository = new ApiReportsRepository();
const adminRepository = new ApiReportsAdminRepository();
const refreshRepository = new ApiRefreshDatasetRepository();
const scheduleRepository = new ApiScheduleReportsRepository();

const getAllReportsUseCase = new GetAllReportsUseCase(reportsRepository);
const syncReportsUseCase = new SyncReportsUseCase(adminRepository);
const activateReportUseCase = new ActivateReportUseCase(adminRepository);
const deactivateReportUseCase = new DeactivateReportUseCase(adminRepository);
const deleteReportUseCase = new DeleteReportUseCase(adminRepository);
const refreshDatasetUseCase = new RefreshDatasetUseCase(refreshRepository);
const checkRefreshStatusUseCase = new CheckRefreshStatusUseCase(
  refreshRepository,
);
const getAllSchedulesUseCase = new GetAllSchedulesUseCase(scheduleRepository);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReportsManagement() {
  const { user: loggedInUser } = useUserMeStore();
  const {
    refreshingIds,
    addRefreshing,
    removeRefreshing,
    isRefreshing: isRefreshingId,
  } = useRefreshingStore();

  const [reports, setReports] = useState<ReportProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mapa reportId → agendamento para lookup O(1) na tabela
  const [scheduleMap, setScheduleMap] = useState<
    Record<string, ScheduleReportProps>
  >({});

  // ─── Carregamento ───────────────────────────────────────────────────────────

  const fetchReports = useCallback(async () => {
    if (!loggedInUser) return;
    setIsLoading(true);
    try {
      // Busca relatórios e agendamentos em paralelo
      const [reportsData, schedulesData] = await Promise.all([
        getAllReportsUseCase.execute(loggedInUser.id),
        getAllSchedulesUseCase.execute(),
      ]);

      setReports(reportsData.reports ?? []);

      // Monta mapa reportId → agendamento para lookup O(1) na tabela
      const map: Record<string, ScheduleReportProps> = {};
      for (const schedule of schedulesData.schedules ?? []) {
        map[schedule.reportId] = schedule;
      }
      setScheduleMap(map);
    } catch (error) {
      handleGlobalError(error);
    } finally {
      setIsLoading(false);
    }
  }, [loggedInUser?.id]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ─── Sincronizar ────────────────────────────────────────────────────────────

  const syncReports = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await syncReportsUseCase.execute();
      setReports(data.reports ?? []);
      toast.success("Relatórios sincronizados com sucesso.");
    } catch (error) {
      handleGlobalError(error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ─── Ativar / Desativar ─────────────────────────────────────────────────────

  const toggleReportActive = useCallback(async (report: ReportProps) => {
    setIsUpdating(report.id);
    try {
      const updated = report.isActive
        ? await deactivateReportUseCase.execute(report.id)
        : await activateReportUseCase.execute(report.id);

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, ...updated } : r)),
      );

      toast.success(
        `Relatório ${updated.isActive ? "ativado" : "desativado"} com sucesso.`,
      );
    } catch (error) {
      handleGlobalError(error);
    } finally {
      setIsUpdating(null);
    }
  }, []);

  // ─── Deletar ────────────────────────────────────────────────────────────────

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      await deleteReportUseCase.execute(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success("Relatório removido com sucesso.");
    } catch (error) {
      handleGlobalError(error);
    }
  }, []);

  // ─── Polling compartilhado ───────────────────────────────────────────────────
  // Extraído para ser reutilizado tanto no refreshDataset quanto no resume

  const runPolling = useCallback(
    async (reportId: string, previousLastUpdate: Date | null | undefined) => {
      const MAX_ATTEMPTS = 60;
      const INTERVAL_MS = 5000;

      try {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));

          const updated = await checkRefreshStatusUseCase.execute(reportId);

          const hasUpdated =
            updated.lastUpdate !== null &&
            new Date(updated.lastUpdate).getTime() !==
              (previousLastUpdate ? new Date(previousLastUpdate).getTime() : 0);

          if (hasUpdated) {
            setReports((prev) =>
              prev.map((r) => (r.id === reportId ? { ...r, ...updated } : r)),
            );
            if (updated.errors) {
              toast.warning(
                "Dataset atualizado com erros. Verifique os detalhes.",
              );
            } else {
              toast.success("Dataset atualizado com sucesso.");
            }
            return;
          }
        }

        toast.warning(
          "O refresh foi solicitado, mas ainda está em andamento. Recarregue a página em instantes.",
        );
      } finally {
        removeRefreshing(reportId);
      }
    },
    [removeRefreshing],
  );

  // ─── Retoma polling após reload ───────────────────────────────────────────────
  // Se há IDs pendentes na store (sessionStorage), retoma o polling sem
  // disparar um novo POST — só faz o check até resolver ou expirar.

  useEffect(() => {
    const pendingIds = useRefreshingStore.getState().refreshingIds;
    if (pendingIds.length === 0 || reports.length === 0) return;

    for (const reportId of pendingIds) {
      const previousLastUpdate = reports.find(
        (r) => r.id === reportId,
      )?.lastUpdate;
      toast.info("Retomando verificação de atualização pendente...");
      runPolling(reportId, previousLastUpdate);
    }
    // Só executa uma vez quando os relatórios são carregados
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports.length > 0]);

  // ─── Refresh Manual com polling ─────────────────────────────────────────────

  const refreshDataset = useCallback(
    async (reportId: string) => {
      if (isRefreshingId(reportId)) return;

      addRefreshing(reportId);

      const previousLastUpdate = reports.find(
        (r) => r.id === reportId,
      )?.lastUpdate;

      try {
        await refreshDatasetUseCase.execute(reportId);
        toast.info("Atualização solicitada. Aguardando conclusão...");
        await runPolling(reportId, previousLastUpdate);
      } catch (error) {
        handleGlobalError(error);
        removeRefreshing(reportId);
      }
    },
    [reports, addRefreshing, removeRefreshing, isRefreshingId, runPolling],
  );

  // ─── Filtro ─────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!searchTerm) return reports;
    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const q = normalize(searchTerm);
    return reports.filter((r) => normalize(r.name ?? "").includes(q));
  }, [reports, searchTerm]);

  // ─── Recarrega apenas o mapa de agendamentos ─────────────────────────────────

  const refreshSchedules = useCallback(async () => {
    try {
      const schedulesData = await getAllSchedulesUseCase.execute();
      const map: Record<string, ScheduleReportProps> = {};
      for (const schedule of schedulesData.schedules ?? []) {
        map[schedule.reportId] = schedule;
      }
      setScheduleMap(map);
    } catch (error) {
      handleGlobalError(error);
    }
  }, []);

  return {
    reports,
    filtered,
    scheduleMap,
    isLoading,
    isSyncing,
    isUpdating,
    isRefreshingId,
    searchTerm,
    setSearchTerm,
    fetchReports,
    refreshSchedules,
    syncReports,
    toggleReportActive,
    deleteReport,
    refreshDataset,
  };
}
