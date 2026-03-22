import { ReportProps } from "@/core/domain/entities/report";
import { RefreshDatasetRepository } from "@/core/domain/repositories/refresh/RefreshDatasetRepository";
import { apiFetch } from "../../apiFetch";

export class ApiRefreshDatasetRepository implements RefreshDatasetRepository {
  async triggerRefresh(reportId: string): Promise<void> {
    await apiFetch<void>(`/api/refresh-dataset/${reportId}/refreshes`, {
      method: "POST",
    });
  }

  async checkRefreshStatus(reportId: string): Promise<ReportProps> {
    return apiFetch<ReportProps>(
      `/api/refresh-dataset/${reportId}/check/refreshes`,
    );
  }
}
