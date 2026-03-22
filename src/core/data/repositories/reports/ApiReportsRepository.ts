import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { ReportsRepository } from "@/core/domain/repositories/reports/ReportsRepository";
import { apiFetch } from "../../apiFetch";

export class ApiReportsRepository implements ReportsRepository {
  async getReportById(reportId: string): Promise<ReportProps> {
    return apiFetch<ReportProps>(`/api/reports/report/${reportId}`);
  }

  async getReports(userId: string): Promise<ListReports> {
    return apiFetch<ListReports>(`/api/reports/user/${userId}/reports`);
  }

  async shareReport(reportId: string, userId: string): Promise<void> {
    await apiFetch<void>(`/api/reports/share`, {
      method: "POST",
      body: JSON.stringify({ reportId, userId }),
    });
  }

  async revokeReport(reportId: string, userId: string): Promise<void> {
    await apiFetch<void>(`/api/reports/revoke`, {
      method: "DELETE",
      body: JSON.stringify({ reportId, userId }),
    });
  }
}
