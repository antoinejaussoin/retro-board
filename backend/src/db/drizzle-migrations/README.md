# Drizzle Migrations

This directory contains Drizzle ORM migration files.

## Overview

After the transition from TypeORM to Drizzle (October 2025), all new database migrations are generated and stored here.

## Historical Context

**Previous System**: TypeORM migrations in `/src/db/migrations/` (114 files, 2019-2023)
**Current System**: Drizzle migrations in this directory (from October 2025 onwards)

## Generating Migrations

### Create a new migration:
```bash
npm run db:generate -- --name descriptive-migration-name
```

This will:
1. Compare your Drizzle schema with the database
2. Generate SQL migration file(s) in this directory
3. Create a migration with a timestamp prefix

### Example:
```bash
npm run db:generate -- --name add-user-preferences
```

Generates: `0001_add_user_preferences.sql`

## Running Migrations

### Development:
```bash
npm run migrate
```

### Production:
```bash
npm run migrate-production
```

## Migration Files

Migration files are plain SQL files that Drizzle generates based on schema changes.

Example structure:
```
drizzle-migrations/
├── 0001_first_drizzle_migration.sql
├── 0002_add_new_column.sql
├── 0003_create_new_table.sql
└── meta/
    ├── _journal.json
    └── 0001_snapshot.json
```

## Important Notes

1. **Do not manually edit** generated migration files unless necessary
2. **Always review** generated migrations before running
3. **Test migrations** on development/staging before production
4. **Keep migrations** in version control
5. **Never delete** migration files once applied to production

## Checking Migration Status

View current migration status:
```bash
npm run migration:report
```

This shows:
- Applied TypeORM migrations (historical)
- Applied Drizzle migrations (current)
- Pending migrations

## Drizzle Studio

Inspect your database schema visually:
```bash
npm run db:studio
```

Opens a web interface at `https://local.drizzle.studio`

## Push vs Migrate

### drizzle-kit push (Development Only)
```bash
npm run db:push
```
- Directly applies schema changes without migration files
- Great for rapid prototyping
- **DO NOT USE IN PRODUCTION**

### drizzle-kit migrate (Production)
```bash
npm run migrate
```
- Runs migration files in order
- Trackable, reviewable, reversible
- **ALWAYS USE IN PRODUCTION**

## Troubleshooting

### Migration out of sync
If database and migrations are out of sync:
1. Check `npm run migration:report`
2. Verify database connection
3. Check migration journal in `meta/_journal.json`

### Manual intervention needed
If a migration needs manual changes:
1. Generate migration: `npm run db:generate -- --name my-change`
2. Edit the generated SQL file
3. Test on development database
4. Run migration: `npm run migrate`

## Migration History

The complete migration history includes:
- **TypeORM era**: See `/src/db/migrations/` (preserved for reference)
- **Drizzle era**: This directory (active migrations)

Transition date: October 26, 2025
Transition marked by: Last TypeORM migration `1695540515122-ModeratorNonNull.ts`

## Resources

- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle Migrations Guide](https://orm.drizzle.team/docs/migrations)
- Project Migration Strategy: `/src/db/MIGRATION_STRATEGY.md`
