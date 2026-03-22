import { ListReports, ReportProps } from "../../entities/report";

export interface ReportsAdminRepository {
  syncReports(): Promise<ListReports>;
  activateReport(reportId: string): Promise<ReportProps>;
  deactivateReport(reportId: string): Promise<ReportProps>;
  deleteReport(reportId: string): Promise<void>;
}
