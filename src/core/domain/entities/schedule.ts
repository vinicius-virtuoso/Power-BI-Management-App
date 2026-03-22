export interface ScheduleReportProps {
  id: string;
  reportId: string;
  hoursCommon: string[];
  isClosingDays: boolean;
  closingDays: string[];
  hoursClosingDays: string[];
  isActive: boolean;
}

export interface CreateScheduleReportData {
  reportId: string;
  hoursCommon: string[];
  isClosingDays: boolean;
  closingDays: string[];
  hoursClosingDays: string[];
}

export interface UpdateScheduleReportData {
  hoursCommon?: string[];
  isClosingDays?: boolean;
  closingDays?: string[];
  hoursClosingDays?: string[];
  isActive?: boolean;
}

export interface ListScheduleReports {
  total: number;
  schedules: ScheduleReportProps[];
}

export class ScheduleReport {
  private readonly props: ScheduleReportProps;

  constructor(props: ScheduleReportProps) {
    this.props = { ...props };
  }

  get id(): string {
    return this.props.id;
  }

  get reportId(): string {
    return this.props.reportId;
  }

  get hoursCommon(): string[] {
    return this.props.hoursCommon;
  }

  get isClosingDays(): boolean {
    return this.props.isClosingDays;
  }

  get closingDays(): string[] {
    return this.props.closingDays;
  }

  get hoursClosingDays(): string[] {
    return this.props.hoursClosingDays;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  toJSON(): ScheduleReportProps {
    return {
      id: this.props.id,
      reportId: this.props.reportId,
      hoursCommon: this.props.hoursCommon,
      isClosingDays: this.props.isClosingDays,
      closingDays: this.props.closingDays,
      hoursClosingDays: this.props.hoursClosingDays,
      isActive: this.props.isActive,
    };
  }
}
