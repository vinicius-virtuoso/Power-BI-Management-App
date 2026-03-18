import { ReportsRepository } from "../repositories/reports/ReportsRepository";

export class GetAllReportsUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(userId: string) {
    return await this.reportsRepository.getReports(userId);
  }
}
