import { ListReports, ReportProps } from "../../entities/report";

export interface ReportsRepository {
  getReports(userId: string): Promise<ListReports>;
  getReportById(reportId: string): Promise<ReportProps>;
  shareReport(reportId: string, userId: string): Promise<void>;
  revokeReport(reportId: string, userId: string): Promise<void>;
}
