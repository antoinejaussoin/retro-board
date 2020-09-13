import { getMovingEntities, calculateRank } from '../moving-logic';
import { ColumnContent } from '../types';
import { Post, User, PostGroup } from 'retro-board-common';
import { getMiddle, getNext, getPrevious } from '../lexorank';

function p(
  id: string,
  column: number,
  rank: string,
  group: PostGroup | null = null
): Post {
  return {
    id,
    action: '',
    column,
    content: '',
    user: ({} as unknown) as User,
    votes: [],
    giphy: null,
    rank,
    group,
  };
}

function g(
  id: string,
  column: number,
  rank: string,
  ...posts: Post[]
): PostGroup {
  return {
    id,
    column,
    rank,
    label: '',
    posts,
    user: ({} as unknown) as User,
  };
}

const game: ColumnContent[] = [
  {
    color: 'blue',
    icon: 'announcement',
    index: 0,
    label: 'Col 1',
    type: 'anchor',
    posts: [
      p('a', 0, getMiddle()),
      p('b', 0, getNext(getMiddle())),
      p('c', 0, getNext(getNext(getMiddle()))),
    ],
    groups: [
      g('g00', 0, getMiddle()),
      g(
        'g01',
        0,
        getNext(getMiddle()),
        p('g01a', 0, getMiddle()),
        p('g01b', 0, getNext(getMiddle())),
        p('g01c', 0, getNext(getNext(getMiddle())))
      ),
    ],
  },
  {
    color: 'red',
    icon: 'announcement',
    index: 1,
    label: 'Col 2',
    type: 'anchor',
    posts: [
      p('x', 1, getMiddle()),
      p('y', 1, getNext(getMiddle())),
      p('z', 1, getNext(getNext(getMiddle()))),
    ],
    groups: [],
  },
  {
    color: 'green',
    icon: 'announcement',
    index: 2,
    label: 'Col 2',
    type: 'anchor',
    posts: [],
    groups: [],
  },
];

describe('When moving a post to a column', () => {
  it('should start with the correct ranks', () => {
    expect(game[0].posts[0].rank).toBe('0|hzzzzz:');
    expect(game[0].posts[1].rank).toBe('0|i00007:');
    expect(game[0].posts[2].rank).toBe('0|i0000f:');
  });

  it('should return the correct values when moving third before second', () => {
    const result = getMovingEntities('c', 'column#0', 1, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].posts[2]);
      expect(result.targetColumn).toBe(0);
      expect(result.previous).toBe(game[0].posts[0]);
      expect(result.next).toBe(game[0].posts[1]);
    }
  });

  it('should return the correct values when moving first to last', () => {
    const result = getMovingEntities('a', 'column#0', 2, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].posts[0]);
      expect(result.targetColumn).toBe(0);
      expect(result.previous).toBe(game[0].posts[2]);
      expect(result.next).toBe(undefined);
    }
  });

  it('should return the correct values when moving post to last in a different column', () => {
    const result = getMovingEntities('a', 'column#1', 3, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].posts[0]);
      expect(result.targetColumn).toBe(1);
      expect(result.previous).toBe(game[1].posts[2]);
      expect(result.next).toBe(undefined);
    }
  });

  it('should return the correct values when moving post to first in a different column', () => {
    const result = getMovingEntities('a', 'column#1', 0, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].posts[0]);
      expect(result.targetColumn).toBe(1);
      expect(result.previous).toBe(undefined);
      expect(result.next).toBe(game[1].posts[0]);
    }
  });

  it('should return the correct values when moving post to first in an empty column', () => {
    const result = getMovingEntities('a', 'column#2', 0, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].posts[0]);
      expect(result.targetColumn).toBe(2);
      expect(result.previous).toBe(undefined);
      expect(result.next).toBe(undefined);
    }
  });
});

describe('When moving a post to a group', () => {
  it('should start with the correct ranks', () => {
    expect(game[0].posts[0].rank).toBe('0|hzzzzz:');
    expect(game[0].posts[1].rank).toBe('0|i00007:');
    expect(game[0].posts[2].rank).toBe('0|i0000f:');
  });

  it('should return the correct values when moving post to empty group', () => {
    const result = getMovingEntities('a', 'group#g00', 0, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].posts[0]);
      expect(result.targetColumn).toBe(0);
      expect(result.targetGroup).toBe(game[0].groups[0]);
      expect(result.previous).toBe(undefined);
      expect(result.next).toBe(undefined);
    }
  });

  it('should return the correct values when moving post to a non empty group', () => {
    const result = getMovingEntities('a', 'group#g01', 1, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].posts[0]);
      expect(result.targetColumn).toBe(0);
      expect(result.targetGroup).toBe(game[0].groups[1]);
      expect(result.previous).toBe(game[0].groups[1].posts[0]);
      expect(result.next).toBe(game[0].groups[1].posts[1]);
    }
  });

  it('should return the correct values when moving post from a group to the same group', () => {
    const result = getMovingEntities('g01a', 'group#g01', 2, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].groups[1].posts[0]);
      expect(result.targetColumn).toBe(0);
      expect(result.targetGroup).toBe(game[0].groups[1]);
      expect(result.previous).toBe(game[0].groups[1].posts[2]);
      expect(result.next).toBe(undefined);
    }
  });

  it('should return the correct values when moving post from a group to another group', () => {
    const result = getMovingEntities('g01b', 'group#g00', 0, game);
    expect(result).not.toBeNull();
    if (!!result) {
      expect(result.post).toBe(game[0].groups[1].posts[1]);
      expect(result.targetColumn).toBe(0);
      expect(result.targetGroup).toBe(game[0].groups[0]);
      expect(result.previous).toBe(undefined);
      expect(result.next).toBe(undefined);
    }
  });
});

describe('When calculating ranks', () => {
  const post = (rank: string): Post => p('', 0, rank);

  describe('When the post doesnt have any neighbours', () => {
    it('Should return the middle value', () => {
      const result = calculateRank();
      expect(result).toBe(getMiddle());
    });
  });

  describe('When the post has a previous, but no next', () => {
    it('Should return a value above the previous', () => {
      const previous = post(getMiddle());
      const result = calculateRank(previous);
      expect(result > previous.rank).toBe(true);
      expect(result).not.toBe(previous.rank);
    });
  });

  describe('When the post has a next, but no previous', () => {
    it('Should return a value under the next', () => {
      const next = post(getMiddle());
      const result = calculateRank(undefined, next);
      expect(result < next.rank).toBe(true);
      expect(result).not.toBe(next.rank);
    });
  });

  describe('When the post has both a next and a previous', () => {
    it('Should return a value between the two', () => {
      const previous = post(getPrevious(getMiddle()));
      const next = post(getMiddle());
      const result = calculateRank(previous, next);
      expect(result > previous.rank).toBe(true);
      expect(result < next.rank).toBe(true);
      expect(result).not.toBe(previous.rank);
      expect(result).not.toBe(next.rank);
    });
  });
});
