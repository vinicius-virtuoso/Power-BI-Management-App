import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { ReportsAdminRepository } from "@/core/domain/repositories/reports/ReportsAdminRepository";
import { apiFetch } from "../../apiFetch";

export class ApiReportsAdminRepository implements ReportsAdminRepository {
  async syncReports(): Promise<ListReports> {
    return apiFetch<ListReports>("/api/reports/sync", { method: "PATCH" });
  }

  async activateReport(reportId: string): Promise<ReportProps> {
    return apiFetch<ReportProps>(`/api/reports/activate/${reportId}`, {
      method: "PATCH",
    });
  }

  async deactivateReport(reportId: string): Promise<ReportProps> {
    return apiFetch<ReportProps>(`/api/reports/deactivate/${reportId}`, {
      method: "PATCH",
    });
  }

  async deleteReport(reportId: string): Promise<void> {
    await apiFetch<void>(`/api/reports/report/${reportId}`, {
      method: "DELETE",
    });
  }
}
