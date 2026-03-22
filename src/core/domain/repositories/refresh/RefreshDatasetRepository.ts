import { ReportProps } from "../../entities/report";

export interface RefreshDatasetRepository {
  triggerRefresh(reportId: string): Promise<void>;
  checkRefreshStatus(reportId: string): Promise<ReportProps>;
}
