import { searchLogic } from '../is-search-match';
import { describe, expect, it } from 'vitest';

describe('Search Match logic', () => {
  it('Should be a match if there is no search (as everything matches)', () => {
    expect(searchLogic('One little piggy', 'Bob Dylan', '', false)).toBe(true);
  });

  it('Should not be a match if the post is blurred', () => {
    expect(searchLogic('One little piggy', 'Bob Dylan', 'little', true)).toBe(
      false
    );
  });

  it('Should be a match if the search matches the content', () => {
    expect(searchLogic('One little piggy', 'Bob Dylan', 'little', false)).toBe(
      true
    );

    expect(searchLogic('One little piggy', 'Bob Dylan', 'LITTLE', false)).toBe(
      true
    );
  });

  it('Should NOT be a match if the search does not matches the content', () => {
    expect(searchLogic('One little piggy', 'Bob Dylan', 'big', false)).toBe(
      false
    );

    expect(searchLogic('One little piggy', 'Bob Dylan', 'litle', false)).toBe(
      false
    );
  });

  it('Should be a match if the search matches the author', () => {
    expect(searchLogic('One little piggy', 'Bob Dylan', 'dyl', false)).toBe(
      true
    );

    expect(searchLogic('One little piggy', 'Bob Dylan', 'bob d', false)).toBe(
      true
    );
  });

  it('Should NOT be a match if the search does not matches the author', () => {
    expect(searchLogic('One little piggy', 'Bob Dylan', 'John', false)).toBe(
      false
    );

    expect(searchLogic('One little piggy', 'Bob Dylan', 'Lenon', false)).toBe(
      false
    );
  });

  it('Should NOT be a match if the author is null', () => {
    expect(searchLogic('One little piggy', null, 'John', false)).toBe(false);
    expect(searchLogic('One little piggy', null, 'Lenon', false)).toBe(false);
  });
});
