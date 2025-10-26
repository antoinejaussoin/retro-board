import {
  pgTable,
  varchar,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sessions } from './sessions.js';
import { sessionTemplates } from './session-templates.js';

export const columnDefinitions = pgTable(
  'columns',
  {
    id: varchar('id').primaryKey(),
    sessionId: varchar('session_id').notNull(),
    type: varchar('type').notNull(),
    index: integer('index').notNull(),
    label: varchar('label').notNull(),
    color: varchar('color').notNull(),
    icon: varchar('icon'),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sessionIdx: index('columns_session_idx').on(table.sessionId),
  }),
);

export const columnDefinitionsRelations = relations(
  columnDefinitions,
  ({ one }) => ({
    session: one(sessions, {
      fields: [columnDefinitions.sessionId],
      references: [sessions.id],
    }),
  }),
);

export const templateColumnDefinitions = pgTable(
  'templates_columns',
  {
    id: varchar('id').primaryKey(),
    templateId: varchar('template_id').notNull(),
    type: varchar('type').notNull(),
    index: integer('index').notNull(),
    label: varchar('label').notNull(),
    color: varchar('color').notNull(),
    icon: varchar('icon'),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    templateIdx: index('templates_columns_template_idx').on(table.templateId),
  }),
);

export const templateColumnDefinitionsRelations = relations(
  templateColumnDefinitions,
  ({ one }) => ({
    template: one(sessionTemplates, {
      fields: [templateColumnDefinitions.templateId],
      references: [sessionTemplates.id],
    }),
  }),
);

export type ColumnDefinition = typeof columnDefinitions.$inferSelect;
export type NewColumnDefinition = typeof columnDefinitions.$inferInsert;
export type TemplateColumnDefinition =
  typeof templateColumnDefinitions.$inferSelect;
export type NewTemplateColumnDefinition =
  typeof templateColumnDefinitions.$inferInsert;
