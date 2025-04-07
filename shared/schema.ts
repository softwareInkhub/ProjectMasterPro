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
  companyId: uuid("company_id").notNull().references(() => companies.id),
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

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  progress: true,
  createdAt: true,
  updatedAt: true,
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

export const insertEpicSchema = createInsertSchema(epics).omit({
  id: true,
  progress: true,
  createdAt: true,
  updatedAt: true,
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

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
