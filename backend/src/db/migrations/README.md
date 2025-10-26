# TypeORM Migrations (Historical)

⚠️ **THIS DIRECTORY IS PRESERVED FOR HISTORICAL REFERENCE ONLY**

## Overview

This directory contains 114 TypeORM migration files that were used from 2019 to 2023.

**Status**: Read-only, historical record
**Active System**: Drizzle migrations in `/src/db/drizzle-migrations/`

## Migration History

- **First Migration**: `1563180728495-Initial.ts` (July 15, 2019)
- **Last Migration**: `1695540515122-ModeratorNonNull.ts` (September 24, 2023)
- **Total Migrations**: 114 files
- **Transition Date**: October 26, 2025

## What These Migrations Did

These migrations built the entire database schema from scratch, including:

1. **Core Tables** (2019)
   - Users, Sessions, Posts, Votes
   - Initial structure

2. **Features Added** (2019-2020)
   - Custom columns
   - Post groups
   - Templates
   - Subscriptions
   - User views

3. **Enhancements** (2020-2021)
   - User identities (OAuth support)
   - Session locking
   - Encrypted sessions
   - Visitors tracking

4. **Advanced Features** (2021-2023)
   - AI chat integration
   - Session timers
   - Moderator controls
   - Tracking fields

## Why Preserved?

These files are kept for:

1. **Historical Reference**: Understanding how the database evolved
2. **Audit Trail**: Complete record of all schema changes
3. **Troubleshooting**: Investigating issues by reviewing past changes
4. **Documentation**: Learning why certain decisions were made

## DO NOT

❌ Run these migrations on new databases
❌ Modify these files
❌ Delete these files
❌ Use TypeORM commands with these files

## Current System

For new migrations, use Drizzle:

```bash
# Generate new migration
npm run db:generate -- --name my-change

# Run migrations
npm run migrate

# Check status
npm run migration:report
```

See `/src/db/drizzle-migrations/README.md` for current migration system.

## Migration Table

The TypeORM `migrations` table in the database still exists and contains records of all these applied migrations. It should not be modified or deleted.

## Key Migrations Reference

### Database Views
- `1604156127611-UserView.ts` - Initial user view
- `1632072153351-SessionView.ts` - Session view with statistics

### Major Features
- `1572704989505-AddCustomColumns.ts` - Custom column support
- `1584800485849-PostGroup.ts` - Post grouping
- `1602703218677-Passwords.ts` - Password authentication
- `1603697704984-Subscriptions.ts` - Pro subscriptions
- `1629042328834-UserIdentity.ts` - OAuth identity system
- `1679854010349-Ai-Messages.ts` - AI chat integration

### Performance
- `1632067126663-IndexEverything.ts` - Database indexing
- `1585000111311-LexorankIndex.ts` - Lexorank performance

## Transition to Drizzle

The transition from TypeORM to Drizzle was completed in October 2025:

1. All TypeORM migrations were preserved
2. Database schema was captured in Drizzle format
3. Transition snapshot was created
4. Future migrations use Drizzle

For details, see `/src/db/MIGRATION_STRATEGY.md`

## Resources

- TypeORM Migration Documentation: https://typeorm.io/migrations
- Project Migration Strategy: `/src/db/MIGRATION_STRATEGY.md`
- Active Migrations: `/src/db/drizzle-migrations/`
