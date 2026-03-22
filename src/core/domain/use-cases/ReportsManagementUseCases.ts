import {
  CreateScheduleReportData,
  UpdateScheduleReportData,
} from "../entities/schedule";
import { RefreshDatasetRepository } from "../repositories/refresh/RefreshDatasetRepository";
import { ReportsAdminRepository } from "../repositories/reports/ReportsAdminRepository";
import { ScheduleReportsRepository } from "../repositories/schedules/ScheduleReportsRepository";

// ─── Reports Admin ────────────────────────────────────────────────────────────

export class SyncReportsUseCase {
  constructor(private repository: ReportsAdminRepository) {}
  async execute() {
    return this.repository.syncReports();
  }
}

export class ActivateReportUseCase {
  constructor(private repository: ReportsAdminRepository) {}
  async execute(reportId: string) {
    return this.repository.activateReport(reportId);
  }
}

export class DeactivateReportUseCase {
  constructor(private repository: ReportsAdminRepository) {}
  async execute(reportId: string) {
    return this.repository.deactivateReport(reportId);
  }
}

export class DeleteReportUseCase {
  constructor(private repository: ReportsAdminRepository) {}
  async execute(reportId: string) {
    return this.repository.deleteReport(reportId);
  }
}

// ─── Schedule Reports ─────────────────────────────────────────────────────────

export class GetScheduleByReportUseCase {
  constructor(private repository: ScheduleReportsRepository) {}
  async execute(reportId: string) {
    return this.repository.getByReportId(reportId);
  }
}

export class GetAllSchedulesUseCase {
  constructor(private repository: ScheduleReportsRepository) {}
  async execute() {
    return this.repository.getAll();
  }
}

export class CreateScheduleReportUseCase {
  constructor(private repository: ScheduleReportsRepository) {}
  async execute(data: CreateScheduleReportData) {
    return this.repository.create(data);
  }
}

export class UpdateScheduleReportUseCase {
  constructor(private repository: ScheduleReportsRepository) {}
  async execute(id: string, data: UpdateScheduleReportData) {
    return this.repository.update(id, data);
  }
}

export class DeleteScheduleReportUseCase {
  constructor(private repository: ScheduleReportsRepository) {}
  async execute(id: string) {
    return this.repository.delete(id);
  }
}

// ─── Refresh Dataset ──────────────────────────────────────────────────────────

export class RefreshDatasetUseCase {
  constructor(private repository: RefreshDatasetRepository) {}
  async execute(reportId: string) {
    return this.repository.triggerRefresh(reportId);
  }
}

export class CheckRefreshStatusUseCase {
  constructor(private repository: RefreshDatasetRepository) {}
  async execute(reportId: string) {
    return this.repository.checkRefreshStatus(reportId);
  }
}
