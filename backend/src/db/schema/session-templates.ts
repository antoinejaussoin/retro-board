import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  numeric,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { templateColumnDefinitions } from './column-definitions.js';

export const sessionTemplates = pgTable(
  'templates',
  {
    id: varchar('id').primaryKey(),
    name: varchar('name').notNull(),
    createdById: varchar('created_by_id').notNull(),
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
    nameIdx: index('templates_name_idx').on(table.name),
    createdByIdx: index('templates_created_by_idx').on(table.createdById),
  }),
);

export const sessionTemplatesRelations = relations(
  sessionTemplates,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [sessionTemplates.createdById],
      references: [users.id],
    }),
    columns: many(templateColumnDefinitions),
  }),
);

export type SessionTemplate = typeof sessionTemplates.$inferSelect;
export type NewSessionTemplate = typeof sessionTemplates.$inferInsert;
