import { pgTable, text, serial, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Company schema
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Department schema
export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentDepartmentId: uuid("parent_department_id").references(() => departments.id),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Group schema
export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User schema
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role", { enum: ["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER", "VIEWER"] }).notNull(),
  departmentId: uuid("department_id").references(() => departments.id),
  companyId: uuid("company_id").references(() => companies.id),
  status: text("status", { enum: ["ACTIVE", "INACTIVE", "PENDING"] }).default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1).optional(),
  role: z.enum(["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER", "VIEWER"]).default("ADMIN").optional(),
});

// Team schema
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentTeamId: uuid("parent_team_id").references(() => teams.id),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Team members junction table
export const teamMembers = pgTable("team_members", {
  teamId: uuid("team_id").notNull().references(() => teams.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project schema
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status", { 
    enum: ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] 
  }).default("PLANNING").notNull(),
  priority: text("priority", { 
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] 
  }).default("MEDIUM").notNull(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  departmentId: uuid("department_id").references(() => departments.id),
  projectManagerId: uuid("project_manager_id").references(() => users.id),
  progress: jsonb("progress").default({ percentage: 0 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Accept and transform string dates to Date objects
    startDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
    endDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
    // Make progress optional with a default value provided in the route handler
    progress: z.object({ percentage: z.number() }).optional(),
  });

// Epic schema
export const epics = pgTable("epics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { 
    enum: ["BACKLOG", "IN_PROGRESS", "COMPLETED"] 
  }).default("BACKLOG").notNull(),
  priority: text("priority", { 
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] 
  }).default("MEDIUM").notNull(),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  progress: jsonb("progress").default({ percentage: 0 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEpicSchema = createInsertSchema(epics)
  .omit({
    id: true,
    progress: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Accept and transform string dates to Date objects
    startDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
    endDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
    // Make progress optional with a default value provided in the route handler
    progress: z.object({ percentage: z.number() }).optional(),
  });

// Story schema
export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  epicId: uuid("epic_id").notNull().references(() => epics.id),
  status: text("status", { 
    enum: ["BACKLOG", "READY", "IN_PROGRESS", "IN_REVIEW", "DONE"] 
  }).default("BACKLOG").notNull(),
  priority: text("priority", { 
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] 
  }).default("MEDIUM").notNull(),
  storyPoints: text("story_points"),
  assigneeId: uuid("assignee_id").references(() => users.id),
  reporterId: uuid("reporter_id").references(() => users.id),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStorySchema = createInsertSchema(stories)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Accept and transform string dates to Date objects
    startDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
    dueDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
  });

// Task schema
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  storyId: uuid("story_id").notNull().references(() => stories.id),
  parentTaskId: uuid("parent_task_id").references(() => tasks.id),
  status: text("status", { 
    enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"] 
  }).default("TODO").notNull(),
  priority: text("priority", { 
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] 
  }).default("MEDIUM").notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id),
  estimatedHours: text("estimated_hours"),
  actualHours: text("actual_hours"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    // Accept and transform string dates to Date objects
    startDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
    dueDate: z.preprocess(
      (val) => (val ? new Date(val as string) : null),
      z.date().nullable().optional()
    ),
  });

// Comment schema
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
  entityType: text("entity_type", { 
    enum: ["EPIC", "STORY", "TASK"] 
  }).notNull(),
  entityId: uuid("entity_id").notNull(),
  parentCommentId: uuid("parent_comment_id").references(() => comments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Attachment schema
export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  size: text("size").notNull(),
  entityType: text("entity_type", { 
    enum: ["EPIC", "STORY", "TASK"] 
  }).notNull(),
  entityId: uuid("entity_id").notNull(),
  uploadedById: uuid("uploaded_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: text("type", { 
    enum: ["TASK_ASSIGNED", "COMMENT_ADDED", "MENTION", "DUE_DATE", "STATUS_CHANGE"] 
  }).notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type", { 
    enum: ["PROJECT", "EPIC", "STORY", "TASK", "COMMENT"] 
  }).notNull(),
  entityId: uuid("entity_id").notNull(),
  isRead: text("is_read").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Location schema for devices
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  zipCode: text("zip_code"),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Device schema
export const devices = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  type: text("type", { 
    enum: ["LAPTOP", "DESKTOP", "TABLET", "PHONE", "SERVER", "OTHER"] 
  }).notNull(),
  status: text("status", { 
    enum: ["AVAILABLE", "ASSIGNED", "MAINTENANCE", "RETIRED"] 
  }).default("AVAILABLE").notNull(),
  purchaseDate: timestamp("purchase_date"),
  warrantyExpiryDate: timestamp("warranty_expiry_date"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  specs: jsonb("specs"),
  notes: text("notes"),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  departmentId: uuid("department_id").references(() => departments.id),
  locationId: uuid("location_id").references(() => locations.id),
  lastAuditDate: timestamp("last_audit_date"),
  nextAuditDate: timestamp("next_audit_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for ORM
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Epic = typeof epics.$inferSelect;
export type InsertEpic = z.infer<typeof insertEpicSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

// For in-memory storage, we need to use string dates instead of Date objects
export interface TaskWithStringDates {
  id: string;
  title: string;
  description?: string;
  storyId: string;
  parentTaskId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assigneeId?: string;
  estimatedHours?: string;
  actualHours?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  tags?: string[];
  checklist?: {
    total: number;
    completed: number;
    items: Array<{
      id: string;
      text: string;
      completed: boolean;
    }>;
  };
}

export interface CommentWithStringDates {
  id: string;
  text: string;
  userId: string;
  entityType: string;
  entityId: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithStringDates {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'TEAM_LEAD' | 'DEVELOPER' | 'VIEWER';
  departmentId?: string | null;
  companyId?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithStringDates {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  companyId: string;
  teamId: string;
  departmentId?: string;
  projectManagerId?: string;
  progress: { percentage: number };
  createdAt: string;
  updatedAt: string;
}

export interface LocationWithStringDates {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceWithStringDates {
  id: string;
  name: string;
  serialNumber: string;
  type: 'LAPTOP' | 'DESKTOP' | 'TABLET' | 'PHONE' | 'SERVER' | 'OTHER';
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED';
  purchaseDate?: string;
  warrantyExpiryDate?: string;
  manufacturer?: string;
  model?: string;
  specs?: Record<string, unknown>;
  notes?: string;
  assignedToId?: string;
  companyId: string;
  departmentId?: string;
  locationId?: string;
  lastAuditDate?: string;
  nextAuditDate?: string;
  createdAt: string;
  updatedAt: string;
}
