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

export interface SelfHostingPayload {
  selfHosted: boolean;
  adminEmail: string;
  licenced: boolean;
  oAuth: OAuthAvailabilities;
}

export interface OAuthAvailabilities {
  google: boolean;
  twitter: boolean;
  slack: boolean;
  microsoft: boolean;
  github: boolean;
}
