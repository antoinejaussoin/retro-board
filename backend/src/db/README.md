# Database Layer

This directory contains the database layer for the Retro Board application, currently supporting both TypeORM and Drizzle ORM during the migration period.

## Directory Structure

```
db/
├── schema/                    # Drizzle schema definitions
│   ├── index.ts              # Schema exports
│   ├── users.ts              # Users, identities, visitors
│   ├── sessions.ts           # Sessions with options
│   ├── posts.ts              # Posts
│   ├── votes.ts              # Votes
│   ├── post-groups.ts        # Post groups (columns)
│   ├── column-definitions.ts # Column templates
│   ├── messages.ts           # Chat messages
│   ├── session-templates.ts  # Session templates
│   ├── subscriptions.ts      # User subscriptions
│   ├── licences.ts           # Licences
│   ├── ai-chat.ts            # AI chat sessions
│   ├── ai-chat-messages.ts   # AI chat messages
│   └── views.ts              # UserView, SessionView
│
├── migrations/               # TypeORM migrations (historical)
│   ├── README.md            # TypeORM migration history
│   └── *.ts                 # 114 TypeORM migrations (2019-2023)
│
├── drizzle-migrations/      # Drizzle migrations (active)
│   └── README.md            # Drizzle migration guide
│
├── entities/                # TypeORM entities (legacy)
│   └── *.ts                 # Original TypeORM entities
│
├── repositories/            # TypeORM repositories (being migrated)
│   └── *.ts                 # Repository pattern implementations
│
├── actions/                 # Business logic layer
│   └── *.ts                 # Action handlers using repositories
│
├── connection.ts            # Dual connection manager
├── drizzle.ts              # Drizzle ORM instance
├── drizzle-transaction.ts  # Transaction wrapper
├── query-helpers.ts        # Common query patterns
├── error-handler.ts        # Unified error handling
├── health-check.ts         # Database health checks
├── migration-tracker.ts    # Migration status tracking
├── index.ts                # TypeORM DataSource
└── config.ts               # Database configuration
```

## Core Files

### Connection Management

#### `connection.ts`
Manages both TypeORM and Drizzle connections during migration:

```typescript
import { initializeConnections, getTypeORMConnection, getDrizzleConnection } from './connection';

// Initialize both ORMs
await initializeConnections();

// Get specific connection
const db = getDrizzleConnection();
const dataSource = getTypeORMConnection();
```

#### `drizzle.ts`
Drizzle ORM instance with PostgreSQL connection:

```typescript
import { db } from './drizzle';

// Use directly for queries
const users = await db.select().from(usersTable);
```

### Query Helpers

#### `query-helpers.ts`
Common CRUD patterns and utilities:

```typescript
import { findOneById, insertOne, updateById, paginate } from './query-helpers';

// Find by ID
const user = await findOneById(db, usersTable, userId);

// Insert with return
const newUser = await insertOne(db, usersTable, { name: 'John', email: 'john@example.com' });

// Update by ID
const updated = await updateById(db, usersTable, userId, { name: 'Jane' });

// Paginate results
const { items, total } = await paginate(
  db.select().from(usersTable),
  { page: 1, limit: 10 }
);
```

### Transaction Handling

#### `drizzle-transaction.ts`
Transaction wrapper matching TypeORM pattern:

```typescript
import { drizzleTransaction } from './drizzle-transaction';

await drizzleTransaction(async (tx) => {
  // All queries in this block are transactional
  await tx.insert(usersTable).values({ name: 'John' });
  await tx.insert(postsTable).values({ userId: 1, content: 'Hello' });
});
```

### Error Handling

#### `error-handler.ts`
Unified error handling for both ORMs:

```typescript
import {
  isDatabaseError,
  isUniqueViolation,
  getUserFriendlyMessage,
  logDatabaseError
} from './error-handler';

try {
  await db.insert(usersTable).values({ email: 'test@example.com' });
} catch (error) {
  if (isUniqueViolation(error)) {
    console.log(getUserFriendlyMessage(error)); // "This email address is already in use"
  }
  logDatabaseError(error, 'user creation');
  throw error;
}
```

### Health Checks

#### `health-check.ts`
Database connection health monitoring:

```typescript
import { checkDatabaseHealth, isHealthy } from './health-check';

// Quick check
if (await isHealthy()) {
  console.log('Database is healthy');
}

// Detailed check
const status = await checkDatabaseHealth();
console.log(status);
// {
//   healthy: true,
//   typeorm: { connected: true },
//   drizzle: { connected: true },
//   timestamp: Date
// }
```

## Schema

### Schema Definition

Schemas are defined in `schema/` directory using Drizzle's schema definition API:

```typescript
import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  created_at: timestamp('created', { withTimezone: true }).notNull().defaultNow(),
});
```

### Relations

Relations are defined separately for type safety:

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
}));
```

### Views

Database views are defined using `pgView()`:

```typescript
import { pgView } from 'drizzle-orm/pg-core';

export const userView = pgView('user_view').as((qb) =>
  qb.select({
    id: usersTable.id,
    name: usersTable.name,
    // ... other fields
  }).from(usersTable)
);
```

## Migrations

### TypeORM Migrations (Historical)

Located in `migrations/`, these are preserved for historical reference:
- **114 migrations** from 2019-07-15 to 2023-09-24
- **Not deleted** - Part of database history
- **Not executed** - Already in production database
- See `migrations/README.md` for details

### Drizzle Migrations (Active)

Located in `drizzle-migrations/`, these are for future schema changes:

```bash
# Generate new migration
npm run migration:generate

# Apply migrations
npm run migration:apply

# Check migration status
npm run migration:status
```

See `drizzle-migrations/README.md` for complete guide.

### Migration Tracking

Use `migration-tracker.ts` to monitor migration status:

```typescript
import { generateMigrationReport } from './migration-tracker';

const report = await generateMigrationReport();
console.log(report);
```

## Best Practices

### Use Query Helpers

Instead of writing raw Drizzle queries, use helpers when possible:

```typescript
// ✅ Good - using helper
const user = await findOneById(db, usersTable, userId);

// ❌ Less preferred - raw query
const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
```

### Use Transactions

Wrap multiple operations in transactions:

```typescript
await drizzleTransaction(async (tx) => {
  const user = await insertOne(tx, usersTable, userData);
  await insertOne(tx, identitiesTable, { userId: user.id, ...identityData });
});
```

### Handle Errors Properly

Use error handler utilities:

```typescript
try {
  await saveUser(data);
} catch (error) {
  if (isUniqueViolation(error)) {
    return { error: getUserFriendlyMessage(error) };
  }
  logDatabaseError(error, 'saveUser');
  throw error;
}
```

### Type Safety

Always use inferred types from schema:

```typescript
import { usersTable } from './schema';

// ✅ Type-safe insert
type NewUser = typeof usersTable.$inferInsert;
const userData: NewUser = { name: 'John', email: 'john@example.com' };

// ✅ Type-safe select
type User = typeof usersTable.$inferSelect;
const users: User[] = await db.select().from(usersTable);
```

## Migration Progress

- ✅ **Phase 1:** Setup and Configuration
- ✅ **Phase 2:** Schema Definition
- ✅ **Phase 3:** Migration History Preservation
- ✅ **Phase 4:** Database Connection & Client
- 🔄 **Phase 5:** Repository Pattern Migration (NEXT)
- ⏳ **Phase 6:** Actions Layer Refactoring
- ⏳ **Phase 7:** View Queries Migration
- ⏳ **Phase 8:** Error Handling Updates
- ⏳ **Phase 9:** Testing & Validation
- ⏳ **Phase 10:** Deployment Strategy

## Environment Configuration

```bash
# Required
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=retroboard

# Optional (defaults shown)
ENABLE_TYPEORM=true    # Enable TypeORM during migration
ENABLE_DRIZZLE=true    # Enable Drizzle
```

## Resources

- [Drizzle Documentation](https://orm.drizzle.team)
- [Migration Plan](../../documentation/typeorm-to-drizzle-migration.md)
- [Phase 4 Completion Report](../../documentation/phase-4-complete.md)
- [Schema Mapping Guide](../../documentation/schema-mapping.md)

## Support

For questions or issues during the migration:
1. Check the migration documentation
2. Review Phase completion reports
3. Check TypeScript types for guidance
4. Use query helpers when unsure
5. Log errors with error-handler utilities
