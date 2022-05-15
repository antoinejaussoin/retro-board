import { Plan, Currency, StripeLocales, AccessErrorType } from './types';

export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
  language: string;
}

export interface ValidateEmailPayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
}

export interface ResetChangePasswordPayload {
  email: string;
  password: string;
  code: string;
}

export interface CreateCustomerPayload {
  email: string;
}

export interface AdminChangePasswordPayload {
  userId: string;
  password: string;
}

export interface CreateSubscriptionPayload {
  plan: Plan;
  currency: Currency;
  locale: StripeLocales;
  domain: string | null;
  yearly: boolean;
}

export interface CreateSessionPayload {
  encryptedCheck?: string;
}

export interface UnauthorizedAccessPayload {
  type?: AccessErrorType;
}

export interface SelfHostedCheckPayload {
  key: string;
}

export interface BackendCapabilities {
  selfHosted: boolean;
  emailAvailable: boolean;
  adminEmail: string;
  licenced: boolean;
  oAuth: OAuthAvailabilities;
  slackClientId?: string;
  disableAnonymous: boolean;
  disablePasswords: boolean;
  disablePasswordRegistration: boolean;
}

export interface OAuthAvailabilities {
  google: boolean;
  twitter: boolean;
  slack: boolean;
  microsoft: boolean;
  github: boolean;
  okta: boolean;
}

export interface DeleteAccountPayload {
  deleteSessions: boolean;
  deletePosts: boolean;
  deleteVotes: boolean;
}

export interface ChatMessagePayload {
  content: string;
}

export interface ChangeUserNamePayload {
  name: string;
}
