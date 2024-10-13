import { v4 } from 'uuid';
import type { Post, Session } from '../../common/types.js';
import type { UserEntity } from '../../db/entities/UserIdentity.js';
import { savePost, saveVote } from './posts.js';
import { createSession, getSession, saveSession } from './sessions.js';
import { getNext, getMiddle } from '../../lexorank.js';
import { registerAnonymousUser } from './users.js';
import type { DeepPartial } from 'typeorm';

export async function createDemoSession(author: UserEntity): Promise<Session> {
  const session = await createSession(author);
  session.name = 'My Retro Demo';
  session.demo = true;
  session.options = {
    ...session.options,
    allowActions: true,
    allowGiphy: true,
    allowMultipleVotes: true,
    allowReordering: true,
    allowSelfVoting: true,
    allowTimer: true,
    allowCancelVote: true,
    allowGrouping: true,
    maxDownVotes: 20,
    maxUpVotes: 20,
    readonlyOnTimerEnd: true,
  };
  await saveSession(author.id, session);
  let rank = getMiddle();

  const otherUser = await registerAnonymousUser(`John Doe^${v4()}`, v4());

  const otherUserId = otherUser?.user?.id;

  async function createPost(
    content: string,
    column: number,
    votes = 0,
    own = false,
  ) {
    if (!otherUserId) {
      return;
    }
    rank = getNext(rank);
    const postData: DeepPartial<Post> = {
      content,
      column,
      giphy: null,
      action: null,
      rank,
      votes: [],
      group: null,
      id: v4(),
    };
    const post = await savePost(
      own ? author.id : otherUserId,
      session.id,
      postData,
    );
    if (post) {
      for (let i = 0; i < votes; i++) {
        saveVote(otherUserId, '', post.id, {
          id: v4(),
          type: 'like',
          user: otherUser.user.toJson(),
        });
      }
    }
    const updatedSession = await getSession(session.id);
    return updatedSession;
  }

  await Promise.all([
    createPost("I'm enjoying our new retrospective board!", 0, 5),
    createPost('I love how we can vote on posts', 0),
    createPost('I wish I discovered this tool sooner 😅', 1, 2, true),
    createPost(
      'Have you tried different settings? Click on "Customise" to see what you can do.',
      2,
    ),
    createPost('Try Giphy by clicking on the yellow smiley face!', 2, 1, true),
    createPost(
      'You can also share this URL with somebody else to collaborate on the same board.',
      2,
    ),
  ]);

  return session;
}
