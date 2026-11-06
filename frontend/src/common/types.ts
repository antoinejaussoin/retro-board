import type { ColumnDefinition, SessionOptions, User } from './generated';

export interface AllSessionSettings {
  name: string | null;
  moderator: User;
  options: SessionOptions;
  columns: ColumnDefinition[];
  locked: boolean;
  timer: string | null;
}

export interface SessionTemplate {
  id: string;
  name: string;
  columns: ColumnDefinition[];
  options: SessionOptions;
  createdBy: User;
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

export interface UserIdentity {
  id: string;
  username: string | null;
  accountType: AccountType;
  photo: string | null;
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
  currency: Currency | null;
  plan: Plan | null;
  planOwner: string | null;
  planOwnerEmail: string | null;
  planAdmins: string[] | null;
  planMembers: string[] | null;
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

export interface Vote {
  id: string;
  user: User;
  type: VoteType;
}

export type VoteType = 'like' | 'dislike';

export type WsErrorType =
  | 'cannot_save_post'
  | 'cannot_save_group'
  | 'cannot_get_session'
  | 'cannot_register_vote'
  | 'cannot_edit_post'
  | 'cannot_edit_group'
  | 'cannot_save_options'
  | 'cannot_save_columns'
  | 'cannot_delete_post'
  | 'cannot_delete_group'
  | 'cannot_rename_session'
  | 'cannot_record_chat_message'
  | 'cannot_cancel_votes'
  | 'unknown_error'
  | 'action_unauthorised';

export type AdminStats = {
  clients: number;
};

export type CoachRole = 'user' | 'assistant' | 'system' | 'function';

export type CoachMessage = {
  role: CoachRole;
  content?: string;
};

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
  | 'game/session/save-options'
  | 'game/session/reset'
  | 'game/session/disconnect'
  | 'game/session/unexpected-disconnection'
  | 'game/session/user-ready'
  | 'game/post/delete'
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
  | 'register/password'
  | 'register/oauth'
  | 'register/anonymous'
  | 'register/demo'
  | 'subscribe/initial'
  | 'subscribe/launch-stripe'
  | 'subscribe/purchased'
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
  | 'rock'
  | 'mad'
  | 'sad'
  | 'glad';

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
  | 'pt-PT'
  | 'no-NO'
  | 'uk-UA'
  | 'sv-S';
