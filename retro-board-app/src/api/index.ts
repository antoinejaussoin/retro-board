import {
  SessionOptions,
  ColumnDefinition,
  User,
  Session,
  SessionTemplate,
  SessionMetadata,
} from 'retro-board-common';
import config from '../utils/getConfig';
import { v4 } from 'uuid';

export async function createGame(): Promise<Session> {
  const response = await fetch(`/api/create`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
  });
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Could not create a session');
}

export async function createCustomGame(
  setDefault: boolean,
  options: SessionOptions,
  columns: ColumnDefinition[]
): Promise<Session> {
  const response = await fetch(`/api/create-custom`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: JSON.stringify({
      options,
      columns,
      setDefault,
    }),
  });
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Could not create a session');
}

export async function me(): Promise<User | null> {
  const response = await fetch('/api/me', {
    credentials: 'same-origin',
  });
  if (response.ok) {
    return (await response.json()) as User;
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
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
  });
  if (response.ok) {
    return true;
  }
  return false;
}

export async function anonymousLogin(username: string): Promise<User | null> {
  const anonymousUsername = getAnonymousUsername(username);
  const response = await fetch(`/api/auth/anonymous/login`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: JSON.stringify({ username: anonymousUsername, password: 'none' }),
  });
  if (response.ok) {
    return await response.json();
  }
  return null;
}

export async function accountLogin(email: string, password: string): Promise<User | null> {
  const response = await fetch(`/api/auth/login`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: JSON.stringify({ username: email, password }),
  });
  if (response.ok) {
    return await response.json();
  }
  return null;
}

interface RegisterResponse {
  user: User | null;
  error: 'already-exists' | 'other' | null;
}

export async function register(name: string, email: string, password: string): Promise<RegisterResponse> {
  const response = await fetch(`/api/register`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
    body: JSON.stringify({ username: email, password, name }),
  });
  if (response.ok) {
    const user = await response.json();
    return {
      user,
      error: null,
    }
  } else if (response.status === 403) {
    return {
      user: null,
      error: 'already-exists',
    }
  }
  return {
    user: null,
    error: 'other',
  };
}

function getAnonymousUsername(username: string): string {
  const key = `anonymous-username-${username}`;
  const storedUsername = localStorage.getItem(key);
  if (storedUsername === null) {
    const generatedUsername = `${username.replace('^', '')}^${v4()}`;
    localStorage.setItem(key, generatedUsername);
    return generatedUsername;
  }
  return storedUsername;
}

export async function updateLanguage(language: string): Promise<User | null> {
  const response = await fetch(`/api/me/language`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
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
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'no-referrer',
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
