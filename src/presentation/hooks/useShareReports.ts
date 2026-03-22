import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ReportProps } from "@/core/domain/entities/report";
import { UserProps } from "@/core/domain/entities/user";
import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import { RevokeReportUseCase } from "@/core/domain/use-cases/RevokeReportUseCase";
import { ShareReportUseCase } from "@/core/domain/use-cases/ShareReportUseCase";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { handleGlobalError } from "@/presentation/utils/errorHandler";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Instâncias únicas ────────────────────────────────────────────────────────

const repository = new ApiReportsRepository();
const getAllReportsUseCase = new GetAllReportsUseCase(repository);
const shareReportUseCase = new ShareReportUseCase(repository);
const revokeReportUseCase = new RevokeReportUseCase(repository);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useShareReports(user: UserProps | null, isOpen: boolean) {
  const { user: loggedInUser } = useUserMeStore();

  const [allReports, setAllReports] = useState<ReportProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Snapshot do servidor — base para o diff no save
  const originalIds = useRef<Set<string>>(new Set());

  // ─── Carregamento ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !user || !loggedInUser) return;

    const load = async () => {
      setIsLoading(true);
      try {
        // Dois fetches em paralelo:
        //   adminData → todos os relatórios do sistema
        //   userData  → apenas os que o usuário selecionado tem acesso
        const [adminData, userData] = await Promise.all([
          getAllReportsUseCase.execute(loggedInUser.id),
          getAllReportsUseCase.execute(user.id),
        ]);

        const userAccessIds = new Set(
          (userData.reports ?? []).map((r) => r.id),
        );

        setAllReports(adminData.reports ?? []);
        setSelectedIds(new Set(userAccessIds));
        originalIds.current = new Set(userAccessIds);
      } catch (error) {
        handleGlobalError(error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isOpen, user?.id, loggedInUser?.id]);

  // Limpa o estado ao fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setAllReports([]);
      setSelectedIds(new Set());
      originalIds.current = new Set();
    }
  }, [isOpen]);

  // ─── Toggle ─────────────────────────────────────────────────────────────────

  const toggleReport = useCallback((reportId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(reportId) ? next.delete(reportId) : next.add(reportId);
      return next;
    });
  }, []);

  // ─── Salvar ─────────────────────────────────────────────────────────────────

  const saveChanges = useCallback(
    async (onSuccess?: () => void) => {
      if (!user) return;

      const toShare: string[] = [];
      const toRevoke: string[] = [];

      for (const report of allReports) {
        const hadAccess = originalIds.current.has(report.id);
        const hasAccess = selectedIds.has(report.id);

        if (!hadAccess && hasAccess) toShare.push(report.id);
        if (hadAccess && !hasAccess) toRevoke.push(report.id);
      }

      if (toShare.length === 0 && toRevoke.length === 0) {
        toast.info("Nenhuma alteração para salvar.");
        return;
      }

      setIsSaving(true);
      try {
        await Promise.all([
          ...toShare.map((reportId) =>
            shareReportUseCase.execute(reportId, user.id),
          ),
          ...toRevoke.map((reportId) =>
            revokeReportUseCase.execute(reportId, user.id),
          ),
        ]);

        originalIds.current = new Set(selectedIds);

        const total = toShare.length + toRevoke.length;
        toast.success(
          `${total} relat${total > 1 ? "órios atualizados" : "ório atualizado"} com sucesso.`,
        );

        onSuccess?.();
      } catch (error) {
        handleGlobalError(error);
      } finally {
        setIsSaving(false);
      }
    },
    [user, allReports, selectedIds],
  );

  // ─── Métricas derivadas ──────────────────────────────────────────────────────

  const hasChanges = useMemo(() => {
    if (selectedIds.size !== originalIds.current.size) return true;
    for (const id of selectedIds) {
      if (!originalIds.current.has(id)) return true;
    }
    return false;
  }, [selectedIds]);

  const changedCount = useMemo(
    () =>
      allReports.filter(
        (r) => originalIds.current.has(r.id) !== selectedIds.has(r.id),
      ).length,
    [selectedIds, allReports],
  );

  const filtered = useMemo(() => {
    if (!searchTerm) return allReports;
    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const q = normalize(searchTerm);
    return allReports.filter((r) => normalize(r.name ?? "").includes(q));
  }, [allReports, searchTerm]);

  // ─── Retorno ────────────────────────────────────────────────────────────────

  return {
    // Estado
    isLoading,
    isSaving,
    searchTerm,
    setSearchTerm,
    selectedIds,
    // Dados
    allReports,
    filtered,
    // Métricas
    hasChanges,
    changedCount,
    // Ações
    toggleReport,
    saveChanges,
  };
}
