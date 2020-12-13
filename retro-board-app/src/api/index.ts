import {
  Session,
  SessionTemplate,
  SessionMetadata,
  RegisterPayload,
  ValidateEmailPayload,
  ResetPasswordPayload,
  ResetChangePasswordPayload,
  FullUser,
  Product,
} from '@retrospected/common';
import config from '../utils/getConfig';
import { v4 } from 'uuid';
import { CHECK_PREFIX, encrypt } from '../crypto/crypto';
import { getItem, setItem } from '../utils/localStorage';

const requestConfig: Partial<RequestInit> = {
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  redirect: 'follow',
  referrer: 'no-referrer',
};

export async function createGame(): Promise<Session> {
  const response = await fetch(`/api/create`, {
    method: 'POST',
    ...requestConfig,
  });
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Could not create a session');
}

export async function createEncryptedGame(
  encryptionKey: string
): Promise<Session> {
  // We are not sending the encryption key to the backend, only an encrypted string
  // so we can check, client-side, that the key used by the user is the correct one.
  const encryptedCheck = encrypt(CHECK_PREFIX, encryptionKey);
  const response = await fetch(`/api/create`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify({
      encryptedCheck,
    }),
  });
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Could not create a session');
}

export async function me(): Promise<FullUser | null> {
  const response = await fetch('/api/me', {
    credentials: 'same-origin',
  });
  if (response.ok) {
    return (await response.json()) as FullUser;
  }
  return null;
}

export async function getProducts(): Promise<Product[] | null> {
  const response = await fetch('/api/stripe/products', {
    credentials: 'same-origin',
  });
  if (response.ok) {
    return (await response.json()) as Product[];
  }
  return null;
}

export async function fetchDefaultTemplate(): Promise<SessionTemplate | null> {
  const response = await fetch('/api/me/default-template', {
    credentials: 'same-origin',
  });
  if (response.ok) {
    return (await response.json()) as SessionTemplate | null;
  }
  return null;
}

export async function fetchPreviousSessions(): Promise<SessionMetadata[]> {
  const response = await fetch('/api/previous', {
    credentials: 'same-origin',
  });
  if (response.ok) {
    return (await response.json()) as SessionMetadata[];
  }
  return Promise.resolve([]);
}

export async function logout() {
  const response = await fetch(`/api/logout`, {
    method: 'POST',
    ...requestConfig,
  });
  if (response.ok) {
    return true;
  }
  return false;
}

export async function anonymousLogin(
  username: string
): Promise<FullUser | null> {
  const anonymousUsername = getAnonymousUsername(username);
  const response = await fetch(`/api/auth/anonymous/login`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify({
      username: anonymousUsername,
      password: '<<<<<NONE>>>>>',
    }),
  });
  if (response.ok) {
    return me();
  }
  return null;
}

export async function accountLogin(
  email: string,
  password: string
): Promise<FullUser | null> {
  const response = await fetch(`/api/auth/login`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify({ username: email, password }),
  });
  if (response.ok) {
    return me();
  }
  return null;
}

interface RegisterResponse {
  user: FullUser | null;
  error: 'already-exists' | 'other' | null;
}

export async function register(
  name: string,
  email: string,
  password: string,
  language: string
): Promise<RegisterResponse> {
  const payload: RegisterPayload = {
    username: email,
    password,
    name,
    language,
  };
  const response = await fetch(`/api/register`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    const user = await response.json();
    return {
      user,
      error: null,
    };
  } else if (response.status === 403) {
    return {
      user: null,
      error: 'already-exists',
    };
  }
  return {
    user: null,
    error: 'other',
  };
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<FullUser | null> {
  const payload: ValidateEmailPayload = { email, code };
  const response = await fetch(`/api/validate`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  }
  return null;
}

export async function resetPassword(email: string): Promise<boolean> {
  const payload: ResetPasswordPayload = { email };
  const response = await fetch(`/api/reset`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    return true;
  }
  return false;
}

export async function resetChangePassword(
  email: string,
  password: string,
  code: string
): Promise<FullUser | null> {
  const payload: ResetChangePasswordPayload = { email, password, code };
  const response = await fetch(`/api/reset-password`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    const user: FullUser = await response.json();
    return user;
  }
  return null;
}

function getAnonymousUsername(username: string): string {
  const key = `anonymous-username-${username}`;
  const storedUsername = getItem(key);
  if (storedUsername === null) {
    const generatedUsername = `${username.replace('^', '')}^${v4()}`;
    setItem(key, generatedUsername);
    return generatedUsername;
  }
  return storedUsername;
}

export async function updateLanguage(
  language: string
): Promise<FullUser | null> {
  const response = await fetch(`/api/me/language`, {
    method: 'POST',
    ...requestConfig,
    body: JSON.stringify({ language }),
  });
  if (response.ok) {
    return await response.json();
  }
  return null;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const response = await fetch(`/api/session/${sessionId}`, {
    method: 'DELETE',
    ...requestConfig,
  });
  if (response.ok) {
    return true;
  }
  return false;
}

export async function getGiphyUrl(giphyId: string): Promise<string | null> {
  const response = await fetch(
    `//api.giphy.com/v1/gifs/${giphyId}?api_key=${config.GiphyApiKey}`
  );
  if (response.ok) {
    const { data } = await response.json();
    return data && data.images ? data.images.downsized_medium.url : null;
  }
  return null;
}
