import { pgTable, serial, text, varchar, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Plan enum
export const planEnum = pgEnum("plan", ["free", "pro"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: varchar("firebase_uid", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  plan: planEnum("plan").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workspaces table
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workspace members table
export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Usage tracking table (para validar limites del plan)
export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  tasksCreated: integer("tasks_created").default(0).notNull(),
  exportsUsed: integer("exports_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  workspaceMembers: many(workspaceMembers),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.userId], references: [users.id] }),
  members: many(workspaceMembers),
  clients: many(clients),
  projects: many(projects),
  tasks: many(tasks),
  usageTracking: many(usageTracking),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  workspace: one(workspaces, { fields: [clients.workspaceId], references: [workspaces.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  workspace: one(workspaces, { fields: [tasks.workspaceId], references: [workspaces.id] }),
}));

export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  workspace: one(workspaces, { fields: [usageTracking.workspaceId], references: [workspaces.id] }),
}));
