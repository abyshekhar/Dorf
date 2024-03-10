import { relations } from "drizzle-orm";
import { boolean, integer, json, pgEnum, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { AdapterAccount } from "next-auth/adapters";





export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: integer("expires_at"),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token", { length: 255 }),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
)

export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
)

export const forms = pgTable("forms", {
  id: varchar("id", { length: 12 }).primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  title: varchar("title", { length: 256 }).notNull(),
  description: varchar("description", { length: 512 }),
  submitText: varchar("submit_text", { length: 256 }).notNull(),
  content: varchar("content", { length: 10000 }),
  published: boolean("published").default(false).notNull(),
  archived: boolean("archived").default(false).notNull(),
  userId: varchar("user_id", { length: 255 }),
})

export const formsRelations = relations(forms, ({ many, one }) => ({
  fields: many(fields),
  submissions: many(submissions),
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
}))

export const fields = pgTable("fields", {
  id: varchar("id", { length: 12 }).primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  type: text("type", {
    enum: [
      "text",
      "password",
      "checkbox",
      "radio",
      "select",
      "textarea",
      "email",
      "number",
      "url",
      "date",
      "time",
      "tel",
    ],
  }).notNull(),
  label: varchar("label", { length: 256 }).notNull(),
  placeholder: varchar("placeholder", { length: 256 }),
  required: boolean("required").default(false).notNull(),
  description: varchar("description", { length: 512 }),
  order: integer("order"),
  minlength: integer("minlength"),
  maxlength: integer("maxlength"),
  options: varchar("options", { length: 512 }),
  formId: text("form_id").notNull(),
})

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  form: one(forms, {
    fields: [fields.formId],
    references: [forms.id],
  }),
}))

export const submissions = pgTable("submissions", {
  id: varchar("id", { length: 12 }).primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  formId: text("form_id").notNull(),
  data: json("data"),
})

export const submissionsRelations = relations(submissions, ({ one }) => ({
  form: one(forms, {
    fields: [submissions.formId],
    references: [forms.id],
  }),
}))

export const webhooks = pgTable("webhooks", {
  id: varchar("id", { length: 12 }).primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  formId: text("form_id").notNull(),
  deleted: boolean("deleted").default(false).notNull(),
  endpoint: text("endpoint").notNull(),
  events: json("events"),
  enabled: boolean("enabled").default(true).notNull(),
  secretKey: varchar("secret_key", { length: 256 }).notNull(),
})

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  form: one(forms, {
    fields: [webhooks.formId],
    references: [forms.id],
  }),
  webhookEvents: many(webhookEvents),
}))

export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id", { length: 12 }).primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  webhookId: text("webhook_id").notNull(),
  submissionId: text("submission_id").notNull(),
  event: varchar("event", { length: 256 }).notNull(),
  statusCode: integer("status_code"),
  status: text("status",{enum :["attempting", "failed", "success"]}).default(
    "attempting"
  ),
  lastAttempt: timestamp("last_attempt"),
  nextAttempt: timestamp("next_attempt"),
  attemptCount: integer("attempt_count").default(0),
})

export const webhookEventRelations = relations(webhookEvents, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookEvents.webhookId],
    references: [webhooks.id],
  }),
  submission: one(submissions, {
    fields: [webhookEvents.submissionId],
    references: [submissions.id],
  }),
}))

export const feedbacks = pgTable("feedback", {
  id: varchar("id", { length: 12 }).primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  text: varchar("text", { length: 512 }).notNull(),
  url: varchar("url", { length: 256 }).notNull(),
  ua: varchar("ua", { length: 256 }).notNull(),
  userId: varchar("userId", { length: 12 }),
})

export const feedbackRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
}))