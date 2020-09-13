import { LexoRank } from 'lexorank';

export function getMiddle(): string {
  return LexoRank.middle().toString();
}

export function getNext(rank: string): string {
  return LexoRank.parse(rank).genNext().toString();
}

export function getPrevious(rank: string): string {
  return LexoRank.parse(rank).genPrev().toString();
}

export function getBetween(before: string, after: string): string {
  try {
    return LexoRank.parse(before).between(LexoRank.parse(after)).toString();
  } catch {
    return before;
  }
}
