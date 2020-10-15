export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
}

export interface ValidateEmailPayload {
  email: string;
  code: string;
}