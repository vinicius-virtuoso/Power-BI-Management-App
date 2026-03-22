import {
  CreateScheduleReportData,
  ListScheduleReports,
  ScheduleReportProps,
  UpdateScheduleReportData,
} from "../../entities/schedule";

export interface ScheduleReportsRepository {
  getAll(): Promise<ListScheduleReports>;
  getByReportId(reportId: string): Promise<ScheduleReportProps | null>;
  create(data: CreateScheduleReportData): Promise<ScheduleReportProps>;
  update(
    id: string,
    data: UpdateScheduleReportData,
  ): Promise<ScheduleReportProps>;
  delete(id: string): Promise<void>;
}
