export interface Session extends PostContainer, Entity {
  name: string | null;
  posts: Post[];
  groups: PostGroup[];
  columns: ColumnDefinition[];
  messages: Message[];
  options: SessionOptions;
  encrypted: string | null;
  locked: boolean;
  createdBy: User;
  ready: string[];
}

export interface SessionMetadata extends Entity {
  name: string | null;
  participants: User[];
  numberOfPosts: number;
  numberOfVotes: number;
  numberOfActions: number;
  created: Date;
  createdBy: User;
  canBeDeleted: boolean;
  encrypted: string | null;
  locked: boolean;
  lockedForUser: boolean;
}

export interface Message extends Entity {
  content: string;
  user: User;
  created: Date;
}

export interface SessionTemplate extends Entity {
  name: string;
  columns: ColumnDefinition[];
  options: SessionOptions;
  createdBy: User;
}

export interface ColumnDefinition extends Entity {
  type: ColumnDefinitionType;
  index: number;
  label: string;
  color: string;
  icon: string | null;
}

export interface SessionOptions {
  maxUpVotes: number | null;
  maxDownVotes: number | null;
  maxPosts: number | null;
  allowActions: boolean;
  allowSelfVoting: boolean;
  allowMultipleVotes: boolean;
  allowAuthorVisible: boolean;
  allowGiphy: boolean;
  allowGrouping: boolean;
  allowReordering: boolean;
  blurCards: boolean;
  newPostsFirst: boolean;
}

export interface Entity {
  id: string;
}

export interface Rankable {
  rank: string;
}

export interface PostContainer extends Entity {
  posts: Post[];
}

export interface Post extends Rankable, Entity {
  column: number;
  content: string;
  action: string | null;
  giphy: string | null;
  user: User;
  group: PostGroup | null;
  votes: VoteExtract[];
}

export interface PostGroup extends PostContainer, Rankable, Entity {
  label: string;
  column: number;
  user: User;
}

export type ProStatus = 'valid' | 'payment_issue' | 'pending';

export type Plan = 'team' | 'unlimited' | 'self-hosted';

export type Currency = 'gbp' | 'eur' | 'usd';

export type AccessErrorType = 'non_pro' | 'locked';

export interface Product {
  name: string;
  plan: Plan;
  gbp: number;
  usd: number;
  eur: number;
  seats: number | null;
  recurring: boolean;
  paymentsUrls?: {
    [currency: string]: string;
  };
}

export interface User extends Entity {
  name: string;
  photo: string | null;
}

export interface UserIdentity extends Entity {
  username: string | null;
  accountType: AccountType;
  photo: string | null;
}

export interface Participant extends User {
  online: boolean;
}

export interface FullUser extends User {
  identityId: string;
  username: string | null;
  accountType: AccountType;
  photo: string | null;
  language: string | null;
  email: string | null;
  canDeleteSession: boolean;
  stripeId: string | null;
  pro: boolean;
  subscriptionsId: string | null;
  currency: Currency | null;
  plan: Plan | null;
  domain: string | null;
  ownPlan: Plan | null;
  ownSubscriptionsId: string | null;
  trial: Date | null;
}

export interface Quota {
  quota: number;
  posts: number;
}

export type AccountType =
  | 'anonymous'
  | 'google'
  | 'twitter'
  | 'github'
  | 'slack'
  | 'microsoft'
  | 'okta'
  | 'password';

export interface Vote extends Entity {
  user: User;
  type: VoteType;
}

export interface VoteExtract extends Entity {
  type: VoteType;
  userName: string;
  userId: string;
}

export type VoteType = 'like' | 'dislike';

export type TrackingEvent =
  | 'custom-modal/open'
  | 'custom-modal/close'
  | 'custom-modal/create'
  | 'custom-modal/fail'
  | 'custom-modal/template/select'
  | 'custom-modal/column/change'
  | 'custom-modal/column/add'
  | 'custom-modal/column/remove'
  | 'custom-modal/template/set-defaut'
  | 'home/create/default'
  | 'home/create/encrypted'
  | 'home/load-previous'
  | 'game/session/edit-options'
  | 'game/session/edit-columns'
  | 'game/session/reset'
  | 'game/session/disconnect'
  | 'game/session/unexpected-disconnection'
  | 'game/session/user-ready'
  | 'game/post/giphy/open'
  | 'game/post/giphy/choose'
  | 'game/post/giphy/toggle'
  | 'account/gdpr/delete-account'
  | 'game/post/extra-menu/open'
  | 'trial/start'
  | 'trial/modal/cancel'
  | 'trial/modal/subscribe'
  | 'trial/modal/open'
  | 'ack/error'
  | 'ack/refresh'
  | 'language/change/';

export type ColumnDefinitionType =
  | 'custom'
  | 'well'
  | 'notWell'
  | 'ideas'
  | 'start'
  | 'stop'
  | 'continue'
  | 'liked'
  | 'learned'
  | 'lacked'
  | 'longedFor'
  | 'anchor'
  | 'cargo'
  | 'island'
  | 'wind'
  | 'rock';

export type StripeLocales =
  | 'ar-AR'
  | 'da-DK'
  | 'de-DE'
  | 'en-US'
  | 'es-ES'
  | 'es-419'
  | 'fi-FI'
  | 'fr-FR'
  | 'he-IL'
  | 'it-IT'
  | 'ja-JP'
  | 'nl-NL'
  | 'pt-BR'
  | 'no-NO'
  | 'sv-S';
