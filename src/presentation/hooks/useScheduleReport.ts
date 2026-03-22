import { ApiScheduleReportsRepository } from "@/core/data/repositories/schedules/ApiScheduleReportsRepository";
import {
  CreateScheduleReportData,
  ScheduleReportProps,
  UpdateScheduleReportData,
} from "@/core/domain/entities/schedule";
import {
  CreateScheduleReportUseCase,
  DeleteScheduleReportUseCase,
  GetScheduleByReportUseCase,
  UpdateScheduleReportUseCase,
} from "@/core/domain/use-cases/ReportsManagementUseCases";
import { handleGlobalError } from "@/presentation/utils/errorHandler";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Instâncias únicas ────────────────────────────────────────────────────────

const repository = new ApiScheduleReportsRepository();
const getScheduleUseCase = new GetScheduleByReportUseCase(repository);
const createScheduleUseCase = new CreateScheduleReportUseCase(repository);
const updateScheduleUseCase = new UpdateScheduleReportUseCase(repository);
const deleteScheduleUseCase = new DeleteScheduleReportUseCase(repository);

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
        const data = await getScheduleUseCase.execute(reportId);
        setSchedule(data); // null se 404 (sem agendamento)
      } catch (error) {
        handleGlobalError(error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [isOpen, reportId]);

  // Limpa ao fechar
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
        const created = await createScheduleUseCase.execute(data);
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
        const updated = await updateScheduleUseCase.execute(id, data);
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
        await deleteScheduleUseCase.execute(id);
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
