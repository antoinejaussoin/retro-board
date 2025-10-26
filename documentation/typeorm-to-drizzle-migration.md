# Migration Plan: TypeORM to Drizzle ORM

## 📋 Comprehensive Migration Plan: TypeORM to Drizzle

### Current State Analysis

Your backend currently uses:
- **TypeORM 0.3.17** with PostgreSQL
- **16 entities** (Session, Post, User, Vote, etc.)
- **2 database views** (UserView, SessionView)
- **~110 migration files** in `/backend/src/db/migrations/`
- **15 custom repositories** with extended functionality
- **Transaction wrapper** pattern using `EntityManager`
- **Custom repositories** extending TypeORM's base Repository
- **Snake case naming strategy** for database columns

---

## Migration Plan Phases

### Phase 1: Setup and Configuration ⚙️

#### 1.1 Install Drizzle Dependencies
```json
// Add to package.json dependencies:
"drizzle-orm": "^0.33.0",
"drizzle-kit": "^0.24.0",
"postgres": "^3.4.4"  // or keep using 'pg'
```

#### 1.2 Create Drizzle Configuration
- **File**: `/backend/drizzle.config.ts`
- Configure connection to existing database
- Set migrations folder to preserve existing migrations
- Configure schema path

#### 1.3 Update Build Scripts
- Modify `package.json` scripts to use Drizzle CLI instead of TypeORM
- Replace `typeorm-ts-node-esm` commands with `drizzle-kit`

---

### Phase 2: Schema Definition 📝

#### 2.1 Convert Entity Decorators to Drizzle Schema
**Location**: `/backend/src/db/schema/`

Convert each entity file:
- `@Entity` → `pgTable()`
- `@Column` → column types (text, varchar, integer, etc.)
- `@PrimaryColumn` → `primaryKey()` or column with `.primaryKey()`
- `@CreateDateColumn` → `timestamp().defaultNow()`
- `@ManyToOne`, `@OneToMany` → foreign key references
- `@Index` → indexes configuration

**Example conversion**:
```typescript
// FROM (TypeORM):
@Entity({ name: 'sessions' })
export class SessionEntity {
  @PrimaryColumn()
  id: string;
  
  @Column({ nullable: true })
  name: string | null;
}

// TO (Drizzle):
export const sessions = pgTable('sessions', {
  id: varchar('id').primaryKey(),
  name: varchar('name'),
});
```

#### 2.2 Define Relations
- Create separate relations object using `relations()` from Drizzle
- Map all OneToMany, ManyToOne, ManyToMany relationships

#### 2.3 Create Database Views
**Challenge**: Drizzle doesn't have built-in view support
**Solutions**:
- **Option A**: Use `sql` template literal to define views as queryable schemas
- **Option B**: Create views via migrations, query as regular tables
- **Option C**: Replace views with queries using Drizzle's query builder

For `UserView` and `SessionView`:
- Define as `pgView()` or use raw SQL
- Maintain same SQL expressions from current `@ViewEntity`

---

### Phase 3: Migration History Preservation 🗄️

#### 3.1 Keep Existing TypeORM Migrations
**Critical**: Do NOT lose migration history

Strategy:
1. **Keep all 110+ TypeORM migration files** in `/backend/src/db/migrations/`
2. Create a "transition migration" that:
   - Marks current schema state
   - Creates `drizzle_migrations` table alongside TypeORM's tracking
3. Use Drizzle's custom migrations table or maintain compatibility

#### 3.2 Migration Table Strategy
Options:
- **Option A**: Run `drizzle-kit introspect` to generate initial schema from existing DB
- **Option B**: Manually mark all TypeORM migrations as applied in Drizzle
- **Option C**: Create mapping layer between TypeORM and Drizzle migration tracking

**Recommended**: Option A - introspect existing database, then manage new migrations with Drizzle

#### 3.3 Update Migration Scripts
```bash
# OLD:
./backend/scripts/create-migration.sh

# NEW: 
drizzle-kit generate:pg --name <migration-name>
drizzle-kit push:pg  # for dev
drizzle-kit migrate  # for production
```

---

### Phase 4: Database Connection & Client 🔌

#### 4.1 Replace DataSource with Drizzle Client
**File**: `/backend/src/db/index.ts`

```typescript
// FROM:
import { DataSource } from 'typeorm';
export const dataSource = new DataSource(ormConfig);

// TO:
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

#### 4.2 Environment Configuration
Update `/backend/src/db/orm-config.ts` → `/backend/src/db/drizzle-config.ts`
- Remove TypeORM-specific options
- Configure Drizzle connection pooling
- Set up logging if needed

---

### Phase 5: Repository Pattern Migration 🏗️

#### 5.1 Refactor BaseRepository
**File**: `/backend/src/db/repositories/BaseRepository.ts`

Current TypeORM pattern:
```typescript
export function getBaseRepository<T>(entity: EntityTarget<T>) {
  return dataSource.getRepository(entity);
}
```

New Drizzle pattern:
```typescript
export class BaseRepository<T extends PgTable> {
  constructor(protected db: DrizzleDB, protected table: T) {}
  
  async findOne(criteria: any) {
    return db.select().from(this.table).where(...).limit(1);
  }
  
  async save(data: any) {
    return db.insert(this.table).values(data).returning();
  }
}
```

#### 5.2 Convert Custom Repositories
For each of the 15 repositories:

**SessionRepository** → Update methods:
- `updateOptions()` → Use Drizzle `update().set()`
- `saveFromJson()` → Use Drizzle `insert().values()`
- Remove `.extend()` pattern, use class methods

**PostRepository**, **VoteRepository**, etc. → Similar conversions

#### 5.3 Query Builder Replacements
Replace TypeORM query patterns:
- `.findOne({ where: {...}})` → `db.select().from().where()`
- `.find()` → `db.select().from()`
- `.save()` → `db.insert().values().returning()`
- `.update()` → `db.update().set().where()`
- `.delete()` → `db.delete().from().where()`

---

### Phase 6: Actions Layer Refactoring 🎯

#### 6.1 Update Transaction Pattern
**File**: `/backend/src/db/actions/transaction.ts`

```typescript
// FROM:
export async function transaction<T>(cb: (manager: EntityManager) => Promise<T>) {
  return await dataSource.transaction(async (manager) => {
    return cb(manager);
  });
}

// TO:
export async function transaction<T>(cb: (tx: DrizzleTransaction) => Promise<T>) {
  return await db.transaction(async (tx) => {
    return cb(tx);
  });
}
```

#### 6.2 Refactor All Action Files
Update 13 action files in `/backend/src/db/actions/`:
- `sessions.ts` - Update session CRUD operations
- `users.ts` - Update user queries and joins
- `posts.ts` - Update post operations
- `votes.ts` - Update vote operations
- `ai.ts` - Update AI chat operations
- `chat.ts` - Update message operations
- `subscriptions.ts` - Update subscription logic
- etc.

**Key changes**:
- Replace `manager.withRepository()` → direct `db.select()`
- Replace `In()` operator → `inArray()`
- Replace `Not()` operator → `not()`
- Replace `MoreThanOrEqual()` → `gte()`

---

### Phase 7: View Queries Migration 👁️

#### 7.1 UserView Conversion
Current: `@ViewEntity` with SQL expression
Options:
1. Create materialized view in migration
2. Use Drizzle subquery for complex join
3. Define as `pgView()` with raw SQL

#### 7.2 SessionView Conversion  
Same as UserView - preserve SQL logic, adapt to Drizzle syntax

---

### Phase 8: Error Handling Updates ⚠️

#### 8.1 Replace TypeORM Error Types
**Files**: `/backend/src/index.ts`, `/backend/src/game.ts`

```typescript
// FROM:
import { QueryFailedError } from 'typeorm';
catch (err) {
  if (err instanceof QueryFailedError) { ... }
}

// TO:
import { DatabaseError } from 'pg';
catch (err) {
  if (err instanceof DatabaseError) { ... }
}
```

---

### Phase 9: Testing & Validation ✅

#### 9.1 Unit Tests
- Update Jest tests for repositories
- Mock Drizzle client instead of TypeORM DataSource
- Test CRUD operations

#### 9.2 Integration Tests
- Test transaction rollbacks
- Verify foreign key constraints
- Test complex queries with joins

#### 9.3 Migration Validation
- Test on staging database
- Verify all data integrity
- Check view query results match

---

### Phase 10: Deployment Strategy 🚀

#### 10.1 Preparation
1. Backup production database
2. Test full migration on staging
3. Document rollback procedure

#### 10.2 Execution
1. Deploy with both ORMs temporarily (if feasible)
2. Switch traffic gradually
3. Monitor for errors

#### 10.3 Cleanup
1. Remove TypeORM dependencies
2. Delete old TypeORM entity files (or archive)
3. Update documentation

---

## File-by-File Checklist

### Configuration Files
- [ ] `backend/package.json` - Update dependencies & scripts
- [ ] `backend/drizzle.config.ts` - Create new file
- [ ] `backend/src/db/index.ts` - Replace DataSource
- [ ] `backend/src/db/orm-config.ts` - Remove or refactor

### Schema Definition (NEW)
- [ ] `backend/src/db/schema/sessions.ts`
- [ ] `backend/src/db/schema/posts.ts`
- [ ] `backend/src/db/schema/users.ts`
- [ ] `backend/src/db/schema/votes.ts`
- [ ] `backend/src/db/schema/columns.ts`
- [ ] `backend/src/db/schema/groups.ts`
- [ ] `backend/src/db/schema/subscriptions.ts`
- [ ] `backend/src/db/schema/messages.ts`
- [ ] `backend/src/db/schema/templates.ts`
- [ ] `backend/src/db/schema/licences.ts`
- [ ] `backend/src/db/schema/ai-chat.ts`
- [ ] `backend/src/db/schema/user-identity.ts`
- [ ] `backend/src/db/schema/index.ts` - Export all schemas
- [ ] `backend/src/db/schema/relations.ts` - Define all relations

### Repositories (16 files to update)
- [ ] `backend/src/db/repositories/BaseRepository.ts`
- [ ] `backend/src/db/repositories/SessionRepository.ts`
- [ ] `backend/src/db/repositories/PostRepository.ts`
- [ ] `backend/src/db/repositories/VoteRepository.ts`
- [ ] `backend/src/db/repositories/UserRepository.ts`
- [ ] `backend/src/db/repositories/UserIdentityRepository.ts`
- [ ] `backend/src/db/repositories/ColumnRepository.ts`
- [ ] `backend/src/db/repositories/PostGroupRepository.ts`
- [ ] `backend/src/db/repositories/MessageRepository.ts`
- [ ] `backend/src/db/repositories/SubscriptionRepository.ts`
- [ ] `backend/src/db/repositories/SessionTemplateRepository.ts`
- [ ] `backend/src/db/repositories/TemplateColumnRepository.ts`
- [ ] `backend/src/db/repositories/LicenceRepository.ts`
- [ ] `backend/src/db/repositories/AiChatRepository.ts`
- [ ] `backend/src/db/repositories/AiChatMessageRepository.ts`
- [ ] `backend/src/db/repositories/index.ts`

### Actions (13 files to update)
- [ ] `backend/src/db/actions/transaction.ts`
- [ ] `backend/src/db/actions/sessions.ts`
- [ ] `backend/src/db/actions/users.ts`
- [ ] `backend/src/db/actions/posts.ts`
- [ ] `backend/src/db/actions/votes.ts`
- [ ] `backend/src/db/actions/chat.ts`
- [ ] `backend/src/db/actions/ai.ts`
- [ ] `backend/src/db/actions/subscriptions.ts`
- [ ] `backend/src/db/actions/licences.ts`
- [ ] `backend/src/db/actions/delete.ts`
- [ ] `backend/src/db/actions/demo.ts`
- [ ] `backend/src/db/actions/merge.ts`
- [ ] `backend/src/db/actions/timer.ts`

### Migrations
- [ ] `backend/scripts/create-migration.sh` - Update to use drizzle-kit
- [ ] Keep all existing TypeORM migrations (110+ files)
- [ ] Create "Drizzle transition" migration

### Views
- [ ] Migrate UserView SQL logic
- [ ] Migrate SessionView SQL logic

### Error Handling
- [ ] `backend/src/index.ts` - Update QueryFailedError
- [ ] `backend/src/game.ts` - Update QueryFailedError

### Scripts
- [ ] Update `migrate` script in package.json
- [ ] Update `migrate-production` script
- [ ] Create new drizzle-based scripts

---

## Estimated Effort

| Phase | Files | Estimated Time |
|-------|-------|----------------|
| Phase 1: Setup | 2-3 files | 2-4 hours |
| Phase 2: Schema | 16 schemas | 2-3 days |
| Phase 3: Migrations | Strategy | 1 day |
| Phase 4: Connection | 2 files | 4 hours |
| Phase 5: Repositories | 16 files | 3-4 days |
| Phase 6: Actions | 13 files | 3-4 days |
| Phase 7: Views | 2 views | 1 day |
| Phase 8: Errors | 2 files | 2 hours |
| Phase 9: Testing | All | 2-3 days |
| Phase 10: Deploy | - | 1 day |
| **TOTAL** | **~70 files** | **3-4 weeks** |

---

## Key Benefits of Migration

✅ **Type Safety**: Better TypeScript inference
✅ **Performance**: Faster queries, no runtime reflection
✅ **Bundle Size**: Smaller than TypeORM
✅ **Developer Experience**: More intuitive API
✅ **SQL-first**: Closer to raw SQL, more control

## Risks & Mitigation

⚠️ **Risk**: Data loss during migration
✅ **Mitigation**: Comprehensive backups, staging testing

⚠️ **Risk**: Breaking existing queries
✅ **Mitigation**: Thorough integration tests, gradual rollout

⚠️ **Risk**: View support limitations
✅ **Mitigation**: Raw SQL fallback, custom view definitions

---

## Next Steps

Would you like to:
1. **Start with Phase 1** - Set up Drizzle configuration?
2. **Create a sample schema conversion** for one entity?
3. **Generate the drizzle.config.ts** file?
4. **Start converting a specific repository** as an example?

Let me know which phase you'd like to tackle first! 🚀
