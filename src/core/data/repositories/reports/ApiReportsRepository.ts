import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { ReportsRepository } from "@/core/domain/repositories/reports/ReportsRepository";

export class ApiReportsRepository implements ReportsRepository {
  async getReportById(reportId: string): Promise<ReportProps> {
    const response = await fetch(`/api/reports/${reportId}`);

    if (!response.ok) {
      throw new Error("Sessão expirada ou inválida");
    }

    return response.json();
  }
  async getReports(): Promise<ListReports> {
    const response = await fetch("/api/reports");

    if (!response.ok) {
      throw new Error("Sessão expirada ou inválida");
    }

    return response.json();
  }
}
