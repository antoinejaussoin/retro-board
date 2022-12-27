import { SessionEntity, PostEntity } from '../entities';
import SessionRepository from './SessionRepository';
import { Post as JsonPost, defaultSession } from '../../common';
import { cloneDeep } from 'lodash';
import { getBaseRepository, saveAndReload } from './BaseRepository';

export default getBaseRepository(PostEntity).extend({
  async updateFromJson(
    sessionId: string,
    post: JsonPost
  ): Promise<PostEntity | undefined> {
    return await saveAndReload(this, {
      ...cloneDeep(post),
      session: {
        id: sessionId,
      },
      votes: undefined,
      user: {
        id: post.user.id,
      },
      group: post.group
        ? {
            id: post.group.id,
          }
        : null,
    });
  },
  async saveFromJson(
    sessionId: string,
    userId: string,
    post: JsonPost
  ): Promise<PostEntity | undefined> {
    const session = await this.manager.findOne(SessionEntity, {
      where: { id: sessionId },
    });
    if (session) {
      return await saveAndReload(this, {
        ...cloneDeep(post),
        user: {
          id: userId,
        },
        session: {
          id: sessionId,
        },
        group: post.group
          ? {
              id: post.group.id,
            }
          : null,
      });
    } else {
      const sessionRepository = this.manager.withRepository(SessionRepository);
      const newSession = {
        ...defaultSession,
        id: sessionId,
      };
      await sessionRepository.saveFromJson(newSession, userId);
      return await this.saveFromJson(sessionId, userId, cloneDeep(post));
    }
  },
});
