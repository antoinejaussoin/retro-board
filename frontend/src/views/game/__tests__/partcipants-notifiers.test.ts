import type { Participant } from 'common';
import { describe, expect, it } from 'vitest';
import {
  getAddedParticipants,
  getRemovedParticipants,
  joinNames,
} from '../participants-notifiers';

function p(id: string, online = true): Participant {
  return {
    id,
    name: id,
    online,
    photo: '',
    email: null,
  };
}

describe('Testing new participants notifier', () => {
  it('should return an empty array if both arrays are empty', () => {
    expect(getAddedParticipants('zigby', [], [])).toHaveLength(0);
  });

  it('should return the one new user', () => {
    const result = getAddedParticipants(
      'zigby',
      [p('alice'), p('bob')],
      [p('alice'), p('bob'), p('charlie')],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('charlie');
  });

  it('should return multiple users', () => {
    const result = getAddedParticipants(
      'zigby',
      [p('alice'), p('bob')],
      [p('alice'), p('bob'), p('charlie'), p('daniele')],
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('charlie');
    expect(result[1].id).toBe('daniele');
  });

  it('should detect going online', () => {
    const result = getAddedParticipants(
      'zigby',
      [p('alice'), p('bob'), p('charlie', false)],
      [p('alice'), p('bob'), p('charlie', true)],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('charlie');
  });

  it('should return multiple users and ignore removed ones', () => {
    const result = getAddedParticipants(
      'zigby',
      [p('alice'), p('bob')],
      [p('alice'), p('charlie'), p('daniele')],
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('charlie');
    expect(result[1].id).toBe('daniele');
  });

  it('should return no users and ignore removed ones', () => {
    const result = getAddedParticipants(
      'zigby',
      [p('alice'), p('bob')],
      [p('alice')],
    );
    expect(result).toHaveLength(0);
  });

  it('should return no users and ignore removed ones', () => {
    const result = getAddedParticipants(
      'zigby',
      [p('alice'), p('bob')],
      [p('alice')],
    );
    expect(result).toHaveLength(0);
  });

  it('should ignore the current user', () => {
    const result = getAddedParticipants(
      'zigby',
      [p('alice'), p('bob')],
      [p('alice'), p('bob'), p('charlie'), p('zigby')],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('charlie');
  });

  it('should ignore if we start from an empty list (it means first connection)', () => {
    const result = getAddedParticipants(
      'zigby',
      [],
      [p('alice'), p('bob'), p('charlie'), p('zigby')],
    );
    expect(result).toHaveLength(0);
  });
});

describe('Testing removed participants notifier', () => {
  it('should return an empty array if both arrays are empty', () => {
    expect(getRemovedParticipants('zigby', [], [])).toHaveLength(0);
  });

  it('should return the one new user', () => {
    const result = getRemovedParticipants(
      'zigby',
      [p('alice'), p('bob'), p('charlie')],
      [p('alice'), p('bob')],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('charlie');
  });

  it('should return multiple users', () => {
    const result = getRemovedParticipants(
      'zigby',
      [p('alice'), p('bob'), p('charlie'), p('daniele')],
      [p('alice'), p('bob')],
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('charlie');
    expect(result[1].id).toBe('daniele');
  });

  it('should detect going offline', () => {
    const result = getRemovedParticipants(
      'zigby',
      [p('alice'), p('bob'), p('charlie', true)],
      [p('alice'), p('bob'), p('charlie', false)],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('charlie');
  });

  it('should return multiple users and ignore added ones', () => {
    const result = getRemovedParticipants(
      'zigby',
      [p('alice'), p('charlie'), p('daniele')],
      [p('alice'), p('bob')],
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('charlie');
    expect(result[1].id).toBe('daniele');
  });

  it('should return no users and ignore removed ones', () => {
    const result = getRemovedParticipants(
      'zigby',
      [p('alice')],
      [p('alice'), p('bob')],
    );
    expect(result).toHaveLength(0);
  });

  it('should ignore the current user', () => {
    const result = getRemovedParticipants(
      'zigby',
      [p('alice'), p('bob'), p('charlie'), p('zigby')],
      [p('alice'), p('bob')],
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('charlie');
  });
});

describe('Join names', () => {
  it('It should return empty if empty', () => {
    expect(joinNames([])).toBe('');
  });

  it('It should return the name if one name', () => {
    expect(joinNames([p('alice')])).toBe('alice');
  });

  it('It should return the names comma separated if more', () => {
    expect(joinNames([p('alice'), p('bob'), p('charlie')])).toBe(
      'alice, bob, charlie',
    );
  });
});
