export type UserRole = "ADMIN" | "USER";

export interface UserProps {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastAccess: Date;
  createdAt: Date;
  updatedAt: Date | null;
}

export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = { ...props };
    this.props.lastAccess = new Date(props.lastAccess);
    this.props.createdAt = new Date(props.createdAt);
    this.props.updatedAt = props.updatedAt ? new Date(props.updatedAt) : null;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastAccess(): Date {
    return new Date(this.props.lastAccess);
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt ? new Date(this.props.updatedAt) : null;
  }

  isAdmin(): boolean {
    return this.props.role === "ADMIN";
  }

  canAccess(): boolean {
    return this.props.isActive;
  }

  toJSON(): UserProps {
    return {
      id: this.props.id,
      email: this.props.email,
      name: this.props.name,
      role: this.props.role,
      isActive: this.props.isActive,
      lastAccess: new Date(this.props.lastAccess),
      createdAt: new Date(this.props.createdAt),
      updatedAt: this.props.updatedAt ? new Date(this.props.updatedAt) : null,
    };
  }
}
