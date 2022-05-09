import { ChangeUserNamePayload, FullUser, Quota } from 'common';
import { fetchGet, fetchPatch, fetchPostGet } from '../../api/fetch';

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

export async function updateUserName(name: string): Promise<FullUser | null> {
  const updated = await fetchPostGet<ChangeUserNamePayload, FullUser | null>(
    `/api/me/username`,
    null,
    { name }
  );
  return updated;
}
