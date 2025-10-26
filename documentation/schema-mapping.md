# TypeORM to Drizzle Schema Mapping

This document shows the exact mapping between TypeORM entities and Drizzle schemas.

## Entity to Schema Mapping

| TypeORM Entity | Drizzle Schema File | Table Name | Notes |
|----------------|---------------------|------------|-------|
| `UserEntity` | `users.ts` | `users` | Tracking fields embedded |
| `UserIdentityEntity` | `users.ts` | `users_identities` | Authentication table |
| `SessionEntity` | `sessions.ts` | `sessions` | SessionOptions embedded |
| `SessionTemplateEntity` | `session-templates.ts` | `templates` | SessionOptions embedded |
| `PostEntity` | `posts.ts` | `posts` | - |
| `VoteEntity` | `votes.ts` | `votes` | - |
| `PostGroupEntity` | `post-groups.ts` | `groups` | - |
| `ColumnDefinitionEntity` | `column-definitions.ts` | `columns` | - |
| `TemplateColumnDefinitionEntity` | `column-definitions.ts` | `templates_columns` | - |
| `MessageEntity` | `messages.ts` | `messages` | - |
| `SubscriptionEntity` | `subscriptions.ts` | `subscriptions` | - |
| `LicenceEntity` | `licences.ts` | `licences` | - |
| `AiChatEntity` | `ai-chat.ts` | `ai_chat` | - |
| `AiChatMessageEntity` | `ai-chat-messages.ts` | `ai_chat_messages` | - |
| `SessionOptionsEntity` | _(embedded)_ | - | Inlined in sessions/templates |
| `TrackingEntity` | _(embedded)_ | - | Inlined in users |
| `UserView` | `views.ts` | `user_view` | Database view |
| `SessionView` | `views.ts` | `session_view` | Database view |

## Decorator to Drizzle Mapping

### Basic Columns

| TypeORM | Drizzle |
|---------|---------|
| `@PrimaryColumn()` | `.primaryKey()` |
| `@Column()` | `varchar()` / `integer()` / etc. |
| `@Column({ nullable: true })` | `varchar()` (no `.notNull()`) |
| `@Column({ default: value })` | `.default(value)` |
| `@CreateDateColumn()` | `timestamp().notNull().defaultNow()` |
| `@UpdateDateColumn()` | `timestamp().notNull().defaultNow()` |

### Indexes

| TypeORM | Drizzle |
|---------|---------|
| `@Index()` | `index('name').on(table.column)` |
| `@Index({ unique: true })` | Use unique constraint or index |
| `@Index(['col1', 'col2'])` | `index().on(table.col1, table.col2)` |

### Relations

| TypeORM | Drizzle |
|---------|---------|
| `@ManyToOne(() => Entity)` | `one(entity, { fields: [...], references: [...] })` |
| `@OneToMany(() => Entity, ...)` | `many(entity)` |
| `@ManyToMany(() => Entity)` | Use junction table + relations |

### Special Types

| TypeORM | Drizzle |
|---------|---------|
| `@Column('text', { array: true })` | `text().array()` |
| `@Column({ type: 'numeric' })` | `numeric()` |
| `@Column({ type: 'timestamp with time zone' })` | `timestamp({ withTimezone: true })` |

## Embedded Entities

### SessionOptionsEntity

**Before (TypeORM)**:
```typescript
@Column(() => SessionOptionsEntity)
public options: SessionOptionsEntity;
```

**After (Drizzle)**:
All fields inlined directly into the sessions/templates table:
```typescript
maxUpVotes: numeric('max_up_votes'),
maxDownVotes: numeric('max_down_votes'),
allowActions: boolean('allow_actions').notNull().default(true),
// ... 20+ more fields
```

### TrackingEntity

**Before (TypeORM)**:
```typescript
@Column(() => TrackingEntity)
public tracking: TrackingEntity;
```

**After (Drizzle)**:
All fields inlined directly into the users table:
```typescript
campaignId: varchar('campaign_id'),
creativeId: varchar('creative_id'),
device: varchar('device'),
// ... etc.
```

## Relations Mapping

### Example: Posts → Session (Many-to-One)

**TypeORM**:
```typescript
@ManyToOne(() => SessionEntity, { nullable: false })
@Index()
public session: SessionEntity;
```

**Drizzle**:
```typescript
// In table definition
sessionId: varchar('session_id').notNull(),

// In relations
export const postsRelations = relations(posts, ({ one }) => ({
  session: one(sessions, {
    fields: [posts.sessionId],
    references: [sessions.id],
  }),
}));
```

### Example: Session → Posts (One-to-Many)

**TypeORM**:
```typescript
@OneToMany(() => PostEntity, (post) => post.session, { cascade: true })
public posts: PostEntity[] | undefined;
```

**Drizzle**:
```typescript
export const sessionsRelations = relations(sessions, ({ many }) => ({
  posts: many(posts),
}));
```

### Example: Users ↔ Sessions (Many-to-Many)

**TypeORM**:
```typescript
@ManyToMany(() => SessionEntity, (session) => session.visitors)
public sessions: SessionEntity[] | undefined;

@ManyToMany(() => UserEntity, (user) => user.sessions)
@JoinTable({ name: 'visitors' })
visitors: UserEntity[] | undefined;
```

**Drizzle**:
```typescript
// Junction table
export const visitors = pgTable('visitors', {
  usersId: varchar('users_id').notNull(),
  sessionsId: varchar('sessions_id').notNull(),
});

// Relations
export const visitorsRelations = relations(visitors, ({ one }) => ({
  user: one(users, { fields: [visitors.usersId], references: [users.id] }),
  session: one(sessions, { fields: [visitors.sessionsId], references: [sessions.id] }),
}));
```

## Views

### UserView

Maintains the exact same SQL query as TypeORM, using Drizzle's `pgView()`:

```typescript
export const userView = pgView('user_view').as((qb) =>
  qb.select({
    id: sql<string>`u.id`.as('id'),
    // ... all other fields with proper types
  })
  .from(sql`users_identities i`)
  .leftJoin(sql`users u`, sql`u.id = i.user_id`)
  // ... all other joins
);
```

### SessionView

Similarly maintains the exact SQL with aggregations and JSON operations.

## Type Safety Comparison

### TypeORM
```typescript
// Partial type safety
const user = await userRepo.findOne({ where: { id: '123' } });
// user is UserEntity | null
```

### Drizzle
```typescript
// Full type safety with inference
const user = await db.query.users.findFirst({
  where: eq(users.id, '123')
});
// user is User | undefined (fully inferred from schema)
```

## Benefits of Drizzle Approach

1. **No Decorators**: Cleaner, more functional approach
2. **Better Types**: Full TypeScript inference
3. **Explicit Relations**: Separate from table definition
4. **SQL-First**: Closer to actual SQL queries
5. **Smaller Bundle**: No runtime reflection
6. **Better Performance**: No metadata overhead

---

See [phase-2-complete.md](./phase-2-complete.md) for full Phase 2 details.
