import { Quota } from '@retrospected/common';
import { fetchGet, fetchPatch } from '../../api/fetch';

export async function getPortalUrl(): Promise<string | null> {
  const response = await fetchGet<{ url: string } | null>(
    `/api/stripe/portal`,
    null
  );
  return response ? response.url : null;
}

export async function getMembers(): Promise<string[] | null> {
  return await fetchGet<string[] | null>(`/api/stripe/members`, null);
}

export async function getQuota(): Promise<Quota | null> {
  return await fetchGet<Quota | null>(`/api/quota`, null);
}

export async function updateMembers(members: string[]): Promise<void> {
  await fetchPatch(`/api/stripe/members`, members);
}
