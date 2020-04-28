import {
  SessionOptions,
  ColumnDefinition,
  User,
  Session,
  SessionTemplate,
  SessionMetadata,
} from 'retro-board-common';
import config from '../utils/getConfig';

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
    body: JSON.stringify({ username: username, password: 'foo' }),
  });
  if (response.ok) {
    return await response.json();
  }
  return null;
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
