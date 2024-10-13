import * as Sentry from '@sentry/browser';

export function requestConfig(): Partial<RequestInit> {
  return {
    mode: 'same-origin',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrer: 'same-origin',
  };
}

export async function fetchGet<T>(url: string, defaultValue: T): Promise<T> {
  try {
    const response = await fetch(url, {
      ...requestConfig(),
    });
    if (response.ok) {
      return (await response.json()) as T;
    }
    return defaultValue;
  } catch (error) {
    logToSentry(error);
    return defaultValue;
  }
}

export async function fetchGetText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      ...requestConfig(),
    });
    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch (error) {
    logToSentry(error);
    return null;
  }
}

async function fetchPostPatchDelete<T>(
  verb: 'PATCH' | 'POST' | 'DELETE',
  url: string,
  payload?: T,
): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: verb,
      body: payload ? JSON.stringify(payload) : undefined,
      ...requestConfig(),
    });
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    logToSentry(error);
    return false;
  }
}

export async function fetchPost<T>(url: string, payload?: T): Promise<boolean> {
  return fetchPostPatchDelete('POST', url, payload);
}
export async function fetchPatch<T>(
  url: string,
  payload?: T,
): Promise<boolean> {
  return fetchPostPatchDelete('PATCH', url, payload);
}

export async function fetchDelete<T>(
  url: string,
  payload?: T,
): Promise<boolean> {
  return fetchPostPatchDelete('DELETE', url, payload);
}

export async function fetchPostGet<T, R>(
  url: string,
  defaultValue: R,
  payload?: T,
): Promise<R> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
      ...requestConfig(),
    });
    if (response.ok) {
      return (await response.json()) as R;
    }
    return defaultValue;
  } catch (error) {
    logToSentry(error);
    return defaultValue;
  }
}

function logToSentry(error: unknown) {
  Sentry.withScope((scope) => {
    scope.setLevel('error');
    Sentry.captureException(error);
  });
}
