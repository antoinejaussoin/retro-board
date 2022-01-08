import { Participant } from 'common';
import difference from 'lodash/difference';

function onlineIds(partipants: Participant[]) {
  return partipants.filter((p) => p.online).map((p) => p.id);
}

export function getAddedParticipants(
  userId: string,
  currentList: Participant[],
  newList: Participant[]
): Participant[] {
  if (!currentList.length) {
    return [];
  }
  const currentIds = onlineIds(currentList);
  const newIds = onlineIds(newList);
  const diff = difference(newIds, currentIds);
  return newList
    .filter((p) => p.id !== userId)
    .filter((p) => diff.includes(p.id));
}

export function getRemovedParticipants(
  userId: string,
  currentList: Participant[],
  newList: Participant[]
): Participant[] {
  const currentIds = onlineIds(currentList);
  const newIds = onlineIds(newList);
  const diff = difference(currentIds, newIds);
  return currentList
    .filter((p) => p.id !== userId)
    .filter((p) => diff.includes(p.id));
}

export function joinNames(participants: Participant[]) {
  return participants.map((p) => p.name).join(', ');
}
