# Repository Migration Guide

This guide explains how to migrate from TypeORM repositories to Drizzle repositories.

## Overview

During the migration phase, both TypeORM and Drizzle repositories coexist. New code should use Drizzle repositories, while existing code continues to work with TypeORM repositories.

## Available Repositories

### Base Repositories

All entities have base repositories available:

```typescript
import {
  sessionsRepository,
  usersRepository,
  postsRepository,
  votesRepository,
  postGroupsRepository,
  columnDefinitionsRepository,
  messagesRepository,
  sessionTemplatesRepository,
  subscriptionsRepository,
  licencesRepository,
  identitiesRepository,
  visitorsRepository,
  aiChatSessionsRepository,
  aiChatMessagesRepository,
} from './db/repositories/drizzle/index.js';
```

### Extended Repositories

Three repositories have custom business logic:

```typescript
import {
  drizzleSessionRepository,
  drizzleUserRepository,
  drizzlePostRepository,
} from './db/repositories/drizzle/index.js';
```

## Basic Usage

### Finding Records

```typescript
// By ID
const user = await usersRepository.findById('user-123');

// By multiple IDs
const users = await usersRepository.findByIds(['user-1', 'user-2', 'user-3']);

// With conditions
import { eq, and } from 'drizzle-orm';
import { users } from './db/schema/index.js';

const activeUsers = await usersRepository.findAll(
  and(
    eq(users.accountType, 'pro'),
    eq(users.language, 'en')
  )
);

// Find one with conditions
const user = await usersRepository.findOne(
  eq(users.email, 'test@example.com')
);
```

### Creating Records

```typescript
// Insert single record
const newUser = await usersRepository.insert({
  id: 'new-user-id',
  name: 'John Doe',
  email: 'john@example.com',
  photo: null,
});

// Insert multiple records
const newPosts = await postsRepository.insertMany([
  { sessionId: 'session-1', userId: 'user-1', content: 'Post 1', rank: 'a0' },
  { sessionId: 'session-1', userId: 'user-2', content: 'Post 2', rank: 'a1' },
]);

// Save (insert or update)
const user = await usersRepository.save({
  id: 'user-123', // If exists, update; otherwise insert
  name: 'Updated Name',
  email: 'updated@example.com',
});
```

### Updating Records

```typescript
// Update by ID
const updated = await usersRepository.update('user-123', {
  name: 'New Name',
  photo: 'https://example.com/photo.jpg',
});

// Update with conditions
import { eq } from 'drizzle-orm';
import { users } from './db/schema/index.js';

const updatedUsers = await usersRepository.updateWhere(
  eq(users.accountType, 'free'),
  { accountType: 'pro' }
);
```

### Deleting Records

```typescript
// Delete by ID
const deleted = await usersRepository.delete('user-123');

// Delete with conditions
import { lt } from 'drizzle-orm';
import { sessions } from './db/schema/index.js';

const oldSessions = await sessionsRepository.deleteWhere(
  lt(sessions.created, new Date('2020-01-01'))
);
```

### Counting and Checking Existence

```typescript
// Count all
const totalUsers = await usersRepository.count();

// Count with conditions
import { eq } from 'drizzle-orm';
import { users } from './db/schema/index.js';

const proUsers = await usersRepository.count(
  eq(users.accountType, 'pro')
);

// Check existence
const exists = await usersRepository.exists('user-123');
```

### Pagination

```typescript
const result = await usersRepository.paginate(
  { page: 1, pageSize: 20 },
  eq(users.accountType, 'pro') // optional filter
);

console.log(result.data); // Array of users
console.log(result.total); // Total count
console.log(result.totalPages); // Total pages
```

## Extended Repository Usage

### SessionRepository

```typescript
import { drizzleSessionRepository } from './db/repositories/drizzle/index.js';

// Update options
await drizzleSessionRepository.updateOptions('session-id', {
  allowActions: true,
  allowSelfVoting: false,
  maxUpVotes: 5,
  maxDownVotes: 3,
  // ... other options
});

// Update name
await drizzleSessionRepository.updateName('session-id', 'New Session Name');

// Save from JSON (used for templates/imports)
const session = await drizzleSessionRepository.saveFromJson(
  {
    id: 'new-session',
    name: 'My Session',
    columns: [
      { id: 'col-1', type: 'well', label: 'What went well', color: '#4CAF50' },
      { id: 'col-2', type: 'notWell', label: 'What needs improvement', color: '#F44336' },
    ],
    options: { /* ... */ },
    // ... other fields
  },
  'author-user-id'
);
```

### UserRepository

```typescript
import { drizzleUserRepository } from './db/repositories/drizzle/index.js';

// Save from JSON
const user = await drizzleUserRepository.saveFromJson({
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  photo: null,
});

// Persist default template
await drizzleUserRepository.persistTemplate('user-id', 'template-id');

// Start trial
const userWithTrial = await drizzleUserRepository.startTrial(fullUser);

// Get related users (users who were in same sessions)
const relatedUserIds = await drizzleUserRepository.getRelatedUsersIds('user-id');
```

### PostRepository

```typescript
import { drizzlePostRepository } from './db/repositories/drizzle/index.js';

// Update from JSON
const post = await drizzlePostRepository.updateFromJson('session-id', {
  id: 'post-123',
  content: 'Updated content',
  action: 'Some action item',
  rank: 'a0',
  user: { id: 'user-id' },
  group: { id: 'group-id' }, // optional
});

// Save new post
const newPost = await drizzlePostRepository.saveFromJson(
  'session-id',
  'user-id',
  {
    content: 'New post content',
    rank: 'a1',
  }
);
```

## Transactions

Both base and extended repositories support transactions:

```typescript
import { drizzleTransaction } from './db/drizzle-transaction.js';
import { usersRepository, postsRepository } from './db/repositories/drizzle/index.js';

await drizzleTransaction(async (tx) => {
  // All operations in this block are transactional
  const user = await usersRepository.insert({
    id: 'user-123',
    name: 'John',
    email: 'john@example.com',
  }, tx);

  await postsRepository.insert({
    sessionId: 'session-1',
    userId: user.id,
    content: 'First post',
    rank: 'a0',
  }, tx);

  // If any operation fails, all changes are rolled back
});
```

## Migration Pattern

### Before (TypeORM)

```typescript
import { UserRepository } from './db/repositories/index.js';

export async function getUser(userId: string) {
  const user = await UserRepository.findOne({ where: { id: userId } });
  return user;
}

export async function createUser(data: any) {
  const user = UserRepository.create(data);
  return await UserRepository.save(user);
}
```

### After (Drizzle)

```typescript
import { usersRepository } from './db/repositories/drizzle/index.js';

export async function getUser(userId: string) {
  const user = await usersRepository.findById(userId);
  return user;
}

export async function createUser(data: any) {
  return await usersRepository.insert(data);
}
```

## Type Safety

All repositories are fully typed:

```typescript
import { users } from './db/schema/index.js';

// Infer types from schema
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// Use in functions
async function createUser(data: NewUser): Promise<User> {
  return await usersRepository.insert(data);
}
```

## Building Complex Queries

For complex queries, you can use Drizzle's query builder directly:

```typescript
import { getDrizzleConnection } from './db/connection.js';
import { users, sessions, visitors } from './db/schema/index.js';
import { eq, and, gte } from 'drizzle-orm';

const db = getDrizzleConnection();

// Join query
const usersWithSessions = await db
  .select({
    userId: users.id,
    userName: users.name,
    sessionId: sessions.id,
    sessionName: sessions.name,
  })
  .from(users)
  .leftJoin(visitors, eq(visitors.usersId, users.id))
  .leftJoin(sessions, eq(sessions.id, visitors.sessionsId))
  .where(gte(sessions.created, new Date('2024-01-01')));
```

## Best Practices

1. **Use transactions** for operations that span multiple tables
2. **Pass transaction context** to all repository methods in a transaction
3. **Use base repositories** for simple CRUD operations
4. **Use extended repositories** for business logic
5. **Prefer type inference** over manual type annotations
6. **Handle null/undefined** properly (Drizzle is stricter than TypeORM)
7. **Convert numeric types** when needed (database uses string for numeric type)

## Common Pitfalls

### Numeric Type Conversion

The database stores numbers as strings for `numeric` columns:

```typescript
// ❌ Wrong
await sessionsRepository.update('session-id', {
  maxUpVotes: 5, // Type error: expects string
});

// ✅ Correct
await sessionsRepository.update('session-id', {
  maxUpVotes: '5', // or String(5)
});
```

### Missing Transaction Context

```typescript
// ❌ Wrong - operations not in same transaction
await drizzleTransaction(async (tx) => {
  await usersRepository.insert(userData); // Missing tx parameter!
  await postsRepository.insert(postData); // Missing tx parameter!
});

// ✅ Correct
await drizzleTransaction(async (tx) => {
  await usersRepository.insert(userData, tx);
  await postsRepository.insert(postData, tx);
});
```

### Undefined vs Null

Drizzle is strict about null vs undefined:

```typescript
// ❌ May cause issues
await usersRepository.insert({
  name: 'John',
  photo: undefined, // Should be null
});

// ✅ Correct
await usersRepository.insert({
  name: 'John',
  photo: null,
});
```

## Next Steps

1. Review existing code using TypeORM repositories
2. Identify candidates for migration (start with simple ones)
3. Update to use Drizzle repositories
4. Test thoroughly
5. Remove TypeORM repository imports once migration is complete
