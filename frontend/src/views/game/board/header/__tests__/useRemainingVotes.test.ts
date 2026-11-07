import { describe, expect, it } from 'vitest';
import { remainingAllowance } from '../useRemainingVotes';

describe('remainingAllowance', () => {
  it('treats a missing limit as unlimited', () => {
    expect(remainingAllowance(null, 4)).toBe('unlimited');
  });

  it('hides a vote type that is turned off', () => {
    expect(remainingAllowance(0, 0)).toBeNull();
  });

  it('returns the votes still available', () => {
    expect(remainingAllowance(3, 1)).toBe(2);
    expect(remainingAllowance(3, 5)).toBe(0);
  });
});
