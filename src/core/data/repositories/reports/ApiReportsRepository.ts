import { ListReports, ReportProps } from "@/core/domain/entities/report";
import { ReportsRepository } from "@/core/domain/repositories/reports/ReportsRepository";
import { apiFetch } from "../../apiFetch";

export class ApiReportsRepository implements ReportsRepository {
  /**
   * Busca detalhes de um relatório específico (geralmente para carregar o token do Power BI)
   */
  async getReportById(reportId: string): Promise<ReportProps> {
    // O apiFetch já devolve o ReportProps ou lança o AppError se der erro
    return apiFetch<ReportProps>(`/api/reports/report/${reportId}`);
  }

  /**
   * Busca a lista de relatórios que um usuário específico tem acesso
   */
  async getReports(userId: string): Promise<ListReports> {
    // Ajustado para usar o utilitário padronizado
    return apiFetch<ListReports>(`/api/reports/user/${userId}/reports`);
  }
}
