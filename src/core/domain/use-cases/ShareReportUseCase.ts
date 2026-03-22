import { ReportsRepository } from "../repositories/reports/ReportsRepository";

export class ShareReportUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportId: string, userId: string): Promise<void> {
    await this.reportsRepository.shareReport(reportId, userId);
  }
}
