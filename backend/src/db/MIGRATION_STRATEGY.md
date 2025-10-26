# Migration Strategy: TypeORM to Drizzle

## Overview

This document outlines the strategy for transitioning from TypeORM migrations to Drizzle migrations while preserving all historical migration data.

## Current State

- **TypeORM Migrations**: 114 migration files in `/src/db/migrations/`
- **TypeORM Table**: `migrations` table tracks applied migrations
- **Schema State**: Current database reflects all 114 migrations

## Strategy: Snapshot and Continue

We're using the **"Snapshot and Continue"** approach:

1. ✅ Keep all TypeORM migration files (historical record)
2. ✅ Create Drizzle schema matching current database state
3. ⏳ Mark transition point in database
4. ⏳ Future migrations use Drizzle only

## Implementation Steps

### Step 1: Preserve TypeORM Migrations (COMPLETE)

All 114 TypeORM migration files remain in `/src/db/migrations/`:
- First: `1563180728495-Initial.ts` (2019-07-15)
- Last: `1695540515122-ModeratorNonNull.ts` (2023-09-24)

**Status**: ✅ Complete - Files preserved

### Step 2: Create Drizzle Schema (COMPLETE)

Created Drizzle schemas matching the final state after all TypeORM migrations:
- 14 schema files in `/src/db/schema/`
- All tables, columns, indexes, constraints defined
- 2 database views (UserView, SessionView)

**Status**: ✅ Complete - Phase 2 completed

### Step 3: Mark Transition Point (THIS STEP)

Create a marker indicating where TypeORM ended and Drizzle began.

**Options**:

#### Option A: Database Comment (Recommended)
Add a comment to the TypeORM migrations table:
```sql
COMMENT ON TABLE migrations IS 
'TypeORM migrations - preserved for history. 
Last migration: 1695540515122-ModeratorNonNull. 
Transitioned to Drizzle on 2025-10-26';
```

**Pros**: 
- Non-intrusive
- Preserves history
- Visible in database tools

**Cons**: 
- Comment only

#### Option B: Transition Migration File
Create a special Drizzle migration that:
- Documents the transition
- Validates schema matches expectations
- Creates Drizzle migration table

**Pros**: 
- Explicit migration in Drizzle history
- Validation included

**Cons**: 
- Adds complexity

#### Option C: Manual Metadata Table
Create a `migration_history` table:
```sql
CREATE TABLE migration_history (
  id SERIAL PRIMARY KEY,
  orm_type VARCHAR(50),
  migration_name VARCHAR(255),
  applied_at TIMESTAMP,
  notes TEXT
);
```

**Pros**: 
- Detailed tracking
- Query-able history

**Cons**: 
- Additional table to maintain

**Chosen Strategy**: Combination of A and B

### Step 4: Initialize Drizzle Migrations

When first deploying with Drizzle:

1. Run migration tracker to verify state
2. Mark transition in database
3. Drizzle will create its own migrations table
4. Future migrations run through Drizzle

### Step 5: Future Migrations

All new migrations use Drizzle:

```bash
# Generate migration
npm run db:generate -- --name add-new-feature

# Review generated SQL
# Edit if needed

# Run migration
npm run migrate
```

## Migration Table Coexistence

Both tables can exist simultaneously:

- **`migrations`** (TypeORM) - Historical record, read-only
- **`__drizzle_migrations`** (Drizzle) - Active migrations going forward

## Rollback Strategy

### Rolling Back to TypeORM

If needed to rollback:

1. Stop using Drizzle migrations
2. Revert code to TypeORM
3. TypeORM reads from `migrations` table
4. Continue with TypeORM

### Rolling Forward to Drizzle

Normal path:

1. Deploy Drizzle code
2. Mark transition point
3. All future migrations use Drizzle
4. TypeORM table remains for reference

## Validation

Use the migration tracker to validate:

```bash
# Check migration status
node --loader ts-node/esm src/db/migration-tracker.ts

# Or via npm script
npm run migration:report
```

This will show:
- TypeORM migrations count
- Last TypeORM migration
- Drizzle migration status
- Transition state

## File Organization

```
backend/src/db/
├── migrations/                  # TypeORM (historical, preserved)
│   ├── 1563180728495-Initial.ts
│   ├── ...
│   └── 1695540515122-ModeratorNonNull.ts
├── drizzle-migrations/          # Drizzle (new, going forward)
│   └── (generated files)
├── schema/                      # Drizzle schema definitions
│   ├── users.ts
│   ├── sessions.ts
│   └── ...
├── migration-tracker.ts         # Utility to track status
└── MIGRATION_STRATEGY.md        # This document
```

## Timeline

| Phase | Status | Date |
|-------|--------|------|
| Phase 1: Setup | ✅ Complete | 2025-10-26 |
| Phase 2: Schema Definition | ✅ Complete | 2025-10-26 |
| Phase 3: Migration Preservation | 🔄 In Progress | 2025-10-26 |
| Phase 4: Database Connection | ⏳ Pending | TBD |
| Phase 5: Repository Migration | ⏳ Pending | TBD |

## Important Notes

1. **DO NOT DELETE** TypeORM migration files - they are the authoritative history
2. **DO NOT MODIFY** the TypeORM `migrations` table manually
3. **TEST** on staging before production
4. **BACKUP** database before transition
5. **DOCUMENT** any issues encountered

## Emergency Contacts

If issues arise:
1. Check `/documentation/` for troubleshooting
2. Review TypeORM migration history
3. Use `migration-tracker.ts` for diagnostics
4. Rollback to TypeORM if critical issue

## Next Steps

1. ✅ Create migration tracker utility
2. ⏳ Add npm scripts for migration management
3. ⏳ Test transition on development database
4. ⏳ Document transition process
5. ⏳ Create staging deployment plan
