import { v4 } from 'uuid';
import { Session } from '../../common/types.js';
import { UserEntity } from '../../db/entities/UserIdentity.js';
import { savePost } from './posts.js';
import { createSession } from './sessions.js';
import { getNext, getMiddle } from '../../lexorank.js';

export async function createDemoSession(author: UserEntity): Promise<Session> {
  const session = await createSession(author);
  let rank = getMiddle();

  async function createPost(content: string, column: number) {
    await savePost(author.id, session.id, {
      content,
      column,
      giphy: null,
      action: null,
      rank,
      votes: [],
      group: null,
      id: v4(),
    });
    rank = getNext(rank);
  }

  await Promise.all([
    createPost('I am enjoying our new retrospective board!', 0),
    createPost('I loved how we can vote on posts!', 0),
    createPost('Where should I go on vacation?', 1),
  ]);

  return session;
}
