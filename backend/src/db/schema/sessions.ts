import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  integer,
  numeric,
  index,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, visitors } from './users.js';
import { posts } from './posts.js';
import { postGroups } from './post-groups.js';
import { columnDefinitions } from './column-definitions.js';
import { messages } from './messages.js';

export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id').primaryKey(),
    name: varchar('name'),
    createdById: varchar('created_by_id').notNull(),
    moderatorId: varchar('moderator_id').notNull(),
    encrypted: varchar('encrypted'),
    locked: boolean('locked').notNull().default(false),
    demo: boolean('demo').notNull().default(false),
    timer: timestamp('timer', { withTimezone: true }),
    ready: text('ready').array().notNull().default([]),
    // Session options (embedded)
    maxUpVotes: numeric('max_up_votes'),
    maxDownVotes: numeric('max_down_votes'),
    maxPosts: numeric('max_posts'),
    allowActions: boolean('allow_actions').notNull().default(true),
    allowSelfVoting: boolean('allow_self_voting').notNull().default(false),
    allowMultipleVotes: boolean('allow_multiple_votes')
      .notNull()
      .default(false),
    allowAuthorVisible: boolean('allow_author_visible')
      .notNull()
      .default(false),
    allowGiphy: boolean('allow_giphy').notNull().default(true),
    allowGrouping: boolean('allow_grouping').notNull().default(true),
    allowReordering: boolean('allow_reordering').notNull().default(true),
    allowCancelVote: boolean('allow_cancel_vote').notNull().default(true),
    allowTimer: boolean('allow_timer').notNull().default(true),
    restrictTitleEditToModerator: boolean('restrict_title_edit_to_moderator')
      .notNull()
      .default(false),
    restrictReorderingToModerator: boolean('restrict_reordering_to_moderator')
      .notNull()
      .default(false),
    restrictGroupingToModerator: boolean('restrict_grouping_to_moderator')
      .notNull()
      .default(false),
    timerDuration: numeric('timer_duration').notNull().default('900'),
    readonlyOnTimerEnd: boolean('readonly_on_timer_end')
      .notNull()
      .default(true),
    blurCards: boolean('blur_cards').notNull().default(false),
    newPostsFirst: boolean('new_posts_first').notNull().default(true),
    // Timestamps
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameIdx: index('sessions_name_idx').on(table.name),
    createdByIdx: index('sessions_created_by_idx').on(table.createdById),
    moderatorIdx: index('sessions_moderator_idx').on(table.moderatorId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [sessions.createdById],
    references: [users.id],
    relationName: 'createdBy',
  }),
  moderator: one(users, {
    fields: [sessions.moderatorId],
    references: [users.id],
    relationName: 'moderator',
  }),
  posts: many(posts),
  groups: many(postGroups),
  columns: many(columnDefinitions),
  messages: many(messages),
  visitors: many(visitors),
}));

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
