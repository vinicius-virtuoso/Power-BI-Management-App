export interface ReportProps {
  id: string;
  externalId: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
  workspaceId: string;
  isActive: boolean;
  lastUpdate: Date | null;
  errors?: null;
  token?: string;
  expiration?: string;
}

export interface ListReports {
  total: number;
  reports: ReportProps[];
}

export class Report {
  private readonly props: ReportProps;

  constructor(props: ReportProps) {
    this.props = { ...props };
    this.props.lastUpdate = props.lastUpdate
      ? new Date(props.lastUpdate)
      : null;
  }

  get id(): string {
    return this.props.id;
  }

  get externalId(): string {
    return this.props.externalId;
  }

  get name(): string {
    return this.props.name;
  }

  get webUrl(): string {
    return this.props.webUrl;
  }

  get embedUrl(): string {
    return this.props.embedUrl;
  }

  get datasetId(): string {
    return this.props.datasetId;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastUpdate(): Date | null {
    return this.props.lastUpdate;
  }

  get errors(): null | undefined {
    return this.props.errors;
  }

  get token(): string | undefined {
    return this.props.token;
  }

  get expiration(): string | undefined {
    return this.props.expiration;
  }

  toJSON(): ReportProps {
    return {
      id: this.props.id,
      externalId: this.props.externalId,
      name: this.props.name,
      webUrl: this.props.webUrl,
      embedUrl: this.props.embedUrl,
      datasetId: this.props.datasetId,
      workspaceId: this.props.workspaceId,
      isActive: this.props.isActive,
      lastUpdate: this.props.lastUpdate
        ? new Date(this.props.lastUpdate)
        : null,
      errors: this.props.errors,
      token: this.props.token,
      expiration: this.props.expiration,
    };
  }
}
