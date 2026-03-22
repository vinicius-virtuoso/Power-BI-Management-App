import {
  CreateScheduleReportData,
  ListScheduleReports,
  ScheduleReportProps,
  UpdateScheduleReportData,
} from "@/core/domain/entities/schedule";
import { AppError } from "@/core/domain/errors/AppError";
import { ScheduleReportsRepository } from "@/core/domain/repositories/schedules/ScheduleReportsRepository";
import { apiFetch } from "../../apiFetch";

export class ApiScheduleReportsRepository implements ScheduleReportsRepository {
  async getAll(): Promise<ListScheduleReports> {
    return apiFetch<ListScheduleReports>("/api/schedule-reports");
  }

  async getByReportId(reportId: string): Promise<ScheduleReportProps | null> {
    try {
      return await apiFetch<ScheduleReportProps>(
        `/api/schedule-reports/report/${reportId}`,
      );
    } catch (error) {
      // 404 significa que ainda não há agendamento para este relatório
      if (error instanceof AppError && error.statusCode === 404) return null;
      throw error;
    }
  }

  async create(data: CreateScheduleReportData): Promise<ScheduleReportProps> {
    return apiFetch<ScheduleReportProps>("/api/schedule-reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(
    id: string,
    data: UpdateScheduleReportData,
  ): Promise<ScheduleReportProps> {
    return apiFetch<ScheduleReportProps>(`/api/schedule-reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/api/schedule-reports/${id}`, { method: "DELETE" });
  }
}
