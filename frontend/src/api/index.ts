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
  BackendCapabilities,
  DeleteAccountPayload,
} from 'common';
import config from '../utils/getConfig';
import { v4 } from 'uuid';
import { CHECK_PREFIX, encrypt } from '../crypto/crypto';
import { getItem, setItem } from '../utils/localStorage';
import {
  fetchGet,
  fetchPost,
  fetchPostGet,
  fetchDelete,
  requestConfig,
} from './fetch';

export async function createGame(): Promise<Session | null> {
  return await fetchPostGet<unknown, Session | null>('/api/create', null);
}

export async function createEncryptedGame(
  encryptionKey: string
): Promise<Session | null> {
  // We are not sending the encryption key to the backend, only an encrypted string
  // so we can check, client-side, that the key used by the user is the correct one.
  const encryptedCheck = encrypt(CHECK_PREFIX, encryptionKey);
  return await fetchPostGet<{ encryptedCheck: string }, Session | null>(
    '/api/create',
    null,
    { encryptedCheck }
  );
}

export async function me(): Promise<FullUser | null> {
  return await fetchGet<FullUser | null>('/api/me', null);
}

export async function getProducts(): Promise<Product[] | null> {
  return await fetchGet<Product[] | null>('/api/stripe/products', null);
}

export async function fetchDefaultTemplate(): Promise<SessionTemplate | null> {
  return await fetchGet<SessionTemplate | null>(
    '/api/me/default-template',
    null
  );
}

export async function fetchPreviousSessions(): Promise<SessionMetadata[]> {
  return await fetchGet<SessionMetadata[]>('/api/previous', []);
}

export async function logout() {
  return await fetchPost('/api/logout');
}

export async function anonymousLogin(
  username: string
): Promise<FullUser | null> {
  const anonymousUsername = getAnonymousUsername(username);
  const password = getAnonUserPassword(anonymousUsername);
  const success = await fetchPost('/api/auth/login', {
    username: `ANONUSER__${anonymousUsername}__ANONUSER`,
    password,
  });

  if (success) {
    return me();
  }
  return null;
}

export async function accountLogin(
  email: string,
  password: string
): Promise<FullUser | null> {
  const success = await fetchPost('/api/auth/login', {
    username: email,
    password,
  });
  if (success) {
    return me();
  }
  return null;
}

interface RegisterResponse {
  user: FullUser | null;
  error: 'already-exists' | 'other' | null;
  loggedIn: boolean;
}

export async function addUser(
  name: string,
  email: string,
  password: string,
  language: string
) {
  return registerBase(name, email, password, language, `/api/user`);
}

export async function register(
  name: string,
  email: string,
  password: string,
  language: string
) {
  return registerBase(name, email, password, language, `/api/register`);
}

async function registerBase(
  name: string,
  email: string,
  password: string,
  language: string,
  endpoint: string
): Promise<RegisterResponse> {
  const payload: RegisterPayload = {
    username: email,
    password,
    name,
    language,
  };
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      ...requestConfig(),
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const { user, loggedIn } = await response.json();
      return {
        user,
        error: null,
        loggedIn,
      };
    } else if (response.status === 403) {
      return {
        user: null,
        error: 'already-exists',
        loggedIn: false,
      };
    }
  } catch (error) {
    // Todo capture in Sentry
    console.error('Could not register', error);
  }
  return {
    user: null,
    error: 'other',
    loggedIn: false,
  };
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<FullUser | null> {
  const payload: ValidateEmailPayload = { email, code };
  return await fetchPostGet<ValidateEmailPayload, FullUser | null>(
    '/api/validate',
    null,
    payload
  );
}

export async function resetPassword(email: string): Promise<boolean> {
  const payload: ResetPasswordPayload = { email };
  return await fetchPost('/api/reset', payload);
}

export async function resetChangePassword(
  email: string,
  password: string,
  code: string
): Promise<FullUser | null> {
  const payload: ResetChangePasswordPayload = { email, password, code };
  return await fetchPostGet<ResetChangePasswordPayload, FullUser | null>(
    '/api/reset-password',
    null,
    payload
  );
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

function getAnonUserPassword(username: string) {
  const key = `anonymous-password-${username}`;
  let password = getItem(key);
  if (!password) {
    password = v4();
    setItem(key, password);
  }
  return password;
}

export async function updateLanguage(
  language: string
): Promise<FullUser | null> {
  return await fetchPostGet<{ language: string }, FullUser | null>(
    '/api/me/language',
    null,
    { language }
  );
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  return await fetchDelete(`/api/session/${sessionId}`);
}

export async function deleteAccount(
  options: DeleteAccountPayload
): Promise<boolean> {
  try {
    return await fetchDelete(`/api/me`, options);
  } catch (err) {
    return false;
  }
}

export async function deleteUser(
  user: FullUser,
  options: DeleteAccountPayload
): Promise<boolean> {
  try {
    return await fetchDelete(`/api/user/${user.identityId}`, options);
  } catch (err) {
    return false;
  }
}

export async function getGiphyUrl(giphyId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `//api.giphy.com/v1/gifs/${giphyId}?api_key=${config.GiphyApiKey}`,
      { credentials: 'omit' }
    );
    if (response.ok) {
      const { data } = await response.json();
      return data && data.images ? data.images.downsized_medium.url : null;
    }
    return null;
  } catch (error) {
    console.error('Could not fetch Giphy', error);
    return null;
  }
}

export async function fetchBackendCapabilities(): Promise<BackendCapabilities | null> {
  return await fetchGet<BackendCapabilities | null>(
    '/api/admin/self-hosting',
    null
  );
}
