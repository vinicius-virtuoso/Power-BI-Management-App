import { ReportsRepository } from "../repositories/reports/ReportsRepository";

export class RevokeReportUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportId: string, userId: string): Promise<void> {
    await this.reportsRepository.revokeReport(reportId, userId);
  }
}
