import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: text("avatar"),
  reputationCount: integer("reputation_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  participantOneId: varchar("participant_one_id").notNull(),
  participantTwoId: varchar("participant_two_id").notNull(),
  itemId: varchar("item_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userReports = pgTable("user_reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull(),
  reportedUserId: varchar("reported_user_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const momentComments = pgTable("moment_comments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  momentId: varchar("moment_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const momentLikes = pgTable("moment_likes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  momentId: varchar("moment_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type UserReport = typeof userReports.$inferSelect;
export type MomentComment = typeof momentComments.$inferSelect;
export type MomentLike = typeof momentLikes.$inferSelect;
