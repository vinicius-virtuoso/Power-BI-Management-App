import { ListReports } from "@/core/domain/entities/report";
import { ReportsRepository } from "@/core/domain/repositories/reports/ReportsRepository";

export class ApiReportsRepository implements ReportsRepository {
  async getReports(): Promise<ListReports> {
    const response = await fetch("/api/reports"); // Chama a nossa rota interna

    if (!response.ok) {
      throw new Error("Sessão expirada ou inválida");
    }

    return response.json();
  }
}
