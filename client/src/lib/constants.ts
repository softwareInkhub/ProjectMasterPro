// Placeholder values for selects and forms
export enum Placeholder {
  UNASSIGNED = "UNASSIGNED",
  NOT_ESTIMATED = "NOT_ESTIMATED",
  NONE = "NONE",
  ALL = "ALL"
}

// Status constants
export enum Status {
  BACKLOG = "BACKLOG",
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  COMPLETED = "COMPLETED",
  BLOCKED = "BLOCKED"
}

// Priority constants
export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

// Epic constants
export enum EpicStatus {
  BACKLOG = "BACKLOG",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

// Project constants
export enum ProjectStatus {
  DRAFT = "DRAFT",
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
  CANCELLED = "CANCELLED"
}

// Device constants
export enum DeviceStatus {
  AVAILABLE = "AVAILABLE",
  ASSIGNED = "ASSIGNED",
  MAINTENANCE = "MAINTENANCE",
  RETIRED = "RETIRED"
}

// Role constants
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  TEAM_LEAD = "TEAM_LEAD",
  DEVELOPER = "DEVELOPER",
  TESTER = "TESTER",
  VIEWER = "VIEWER"
}