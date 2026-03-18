import { ListReports, ReportProps } from "../../entities/report";

export interface ReportsRepository {
  getReports(userId: string): Promise<ListReports>;
  getReportById(reportId: string): Promise<ReportProps>;
}
