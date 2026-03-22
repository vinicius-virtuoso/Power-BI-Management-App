import {
  createScheduleReportUseCase,
  deleteScheduleReportUseCase,
  getScheduleByReportUseCase,
  updateScheduleReportUseCase,
} from "@/core/container";
import {
  CreateScheduleReportData,
  ScheduleReportProps,
  UpdateScheduleReportData,
} from "@/core/domain/entities/schedule";

import { handleGlobalError } from "@/presentation/utils/errorHandler";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Instâncias únicas ────────────────────────────────────────────────────────

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScheduleReport(reportId: string | null, isOpen: boolean) {
  const [schedule, setSchedule] = useState<ScheduleReportProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Carregamento ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !reportId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getScheduleByReportUseCase.execute(reportId);
        setSchedule(data);
      } catch (error) {
        handleGlobalError(error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isOpen, reportId]);

  useEffect(() => {
    if (!isOpen) setSchedule(null);
  }, [isOpen]);

  // ─── Criar ──────────────────────────────────────────────────────────────────

  const createSchedule = useCallback(
    async (
      data: CreateScheduleReportData,
      onSuccess?: () => void | Promise<void>,
    ) => {
      setIsSaving(true);
      try {
        const created = await createScheduleReportUseCase.execute(data);
        setSchedule(created);
        toast.success("Agendamento criado com sucesso.");
        await onSuccess?.();
      } catch (error) {
        handleGlobalError(error);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // ─── Atualizar ──────────────────────────────────────────────────────────────

  const updateSchedule = useCallback(
    async (
      id: string,
      data: UpdateScheduleReportData,
      onSuccess?: () => void | Promise<void>,
    ) => {
      setIsSaving(true);
      try {
        const updated = await updateScheduleReportUseCase.execute(id, data);
        setSchedule(updated);
        toast.success("Agendamento atualizado com sucesso.");
        await onSuccess?.();
      } catch (error) {
        handleGlobalError(error);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // ─── Deletar ────────────────────────────────────────────────────────────────

  const deleteSchedule = useCallback(
    async (id: string, onSuccess?: () => void | Promise<void>) => {
      setIsDeleting(true);
      try {
        await deleteScheduleReportUseCase.execute(id);
        setSchedule(null);
        toast.success("Agendamento removido com sucesso.");
        await onSuccess?.();
      } catch (error) {
        handleGlobalError(error);
      } finally {
        setIsDeleting(false);
      }
    },
    [],
  );

  return {
    schedule,
    isLoading,
    isSaving,
    isDeleting,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
