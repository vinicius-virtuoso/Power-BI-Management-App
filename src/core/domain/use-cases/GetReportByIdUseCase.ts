import { ReportsRepository } from "../repositories/reports/ReportsRepository";

export class GetReportByIdUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportId: string) {
    return await this.reportsRepository.getReportById(reportId);
  }
}
