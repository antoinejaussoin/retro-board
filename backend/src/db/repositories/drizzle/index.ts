/**
 * Drizzle Repository Factory
 *
 * Provides repository instances for all entities using Drizzle ORM
 */

import {
  DrizzleBaseRepository,
  type DrizzleTransaction,
} from '../DrizzleBaseRepository.js';
import * as schema from '../../schema/index.js';

// Import extended repositories
import { drizzleSessionRepository } from './SessionRepository.js';
import { drizzleUserRepository } from './UserRepository.js';
import { drizzlePostRepository } from './PostRepository.js';
import { drizzlePostGroupRepository } from './PostGroupRepository.js';
import { drizzleVoteRepository } from './VoteRepository.js';
import { drizzleSessionTemplateRepository } from './SessionTemplateRepository.js';

// Re-export base repository and transaction type
export { DrizzleBaseRepository, type DrizzleTransaction };

// Re-export extended repositories
export {
  drizzleSessionRepository,
  drizzleUserRepository,
  drizzlePostRepository,
  drizzlePostGroupRepository,
  drizzleVoteRepository,
  drizzleSessionTemplateRepository,
};

// Create repositories for all entities
export const sessionsRepository = new DrizzleBaseRepository(schema.sessions);
export const usersRepository = new DrizzleBaseRepository(schema.users);
export const postsRepository = new DrizzleBaseRepository(schema.posts);
export const votesRepository = new DrizzleBaseRepository(schema.votes);
export const postGroupsRepository = new DrizzleBaseRepository(
  schema.postGroups,
);
export const columnDefinitionsRepository = new DrizzleBaseRepository(
  schema.columnDefinitions,
);
export const messagesRepository = new DrizzleBaseRepository(schema.messages);
export const sessionTemplatesRepository = new DrizzleBaseRepository(
  schema.sessionTemplates,
);
export const subscriptionsRepository = new DrizzleBaseRepository(
  schema.subscriptions,
);
export const licencesRepository = new DrizzleBaseRepository(schema.licences);
export const identitiesRepository = new DrizzleBaseRepository(
  schema.usersIdentities,
);
export const visitorsRepository = new DrizzleBaseRepository(schema.visitors);
export const aiChatSessionsRepository = new DrizzleBaseRepository(
  schema.aiChat,
);
export const aiChatMessagesRepository = new DrizzleBaseRepository(
  schema.aiChatMessages,
);

// Repository types
export type SessionsRepository = typeof sessionsRepository;
export type UsersRepository = typeof usersRepository;
export type PostsRepository = typeof postsRepository;
export type VotesRepository = typeof votesRepository;
export type PostGroupsRepository = typeof postGroupsRepository;
export type ColumnDefinitionsRepository = typeof columnDefinitionsRepository;
export type MessagesRepository = typeof messagesRepository;
export type SessionTemplatesRepository = typeof sessionTemplatesRepository;
export type SubscriptionsRepository = typeof subscriptionsRepository;
export type LicencesRepository = typeof licencesRepository;
export type IdentitiesRepository = typeof identitiesRepository;
export type VisitorsRepository = typeof visitorsRepository;
export type AiChatSessionsRepository = typeof aiChatSessionsRepository;
export type AiChatMessagesRepository = typeof aiChatMessagesRepository;
