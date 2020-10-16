export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
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