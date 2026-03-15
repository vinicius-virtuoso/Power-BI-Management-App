import { ListReports, ReportProps } from "../../entities/report";

export interface ReportsRepository {
  getReports(): Promise<ListReports>;
  getReportById(reportId: string): Promise<ReportProps>;
}
