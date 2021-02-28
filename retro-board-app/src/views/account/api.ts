import { Quota } from '@retrospected/common';

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

export async function getPortalUrl(): Promise<string | null> {
  const response = await fetch(`/api/stripe/portal`, {
    method: 'GET',
    ...requestConfig,
  });
  if (response.ok) {
    const session: { url: string } = await response.json();
    return session.url;
  }
  return null;
}

export async function getMembers(): Promise<string[] | null> {
  const response = await fetch(`/api/stripe/members`, {
    method: 'GET',
    ...requestConfig,
  });
  if (response.ok) {
    const members: string[] = await response.json();
    return members;
  }
  return null;
}

export async function getQuota(): Promise<Quota | null> {
  const response = await fetch(`/api/quota`, {
    method: 'GET',
    ...requestConfig,
  });
  if (response.ok) {
    const quota: Quota | null = await response.json();
    return quota;
  }
  return null;
}
export async function updateMembers(members: string[]): Promise<void> {
  await fetch(`/api/stripe/members`, {
    method: 'PATCH',
    ...requestConfig,
    body: JSON.stringify(members),
  });
}
