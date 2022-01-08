import { EntityRepository } from 'typeorm';
import { SessionEntity, PostEntity } from '../entities';
import SessionRepository from './SessionRepository';
import { Post as JsonPost, defaultSession } from '../../common';
import { cloneDeep } from 'lodash';
import BaseRepository from './BaseRepository';

@EntityRepository(PostEntity)
export default class PostRepository extends BaseRepository<PostEntity> {
  async updateFromJson(
    sessionId: string,
    post: JsonPost
  ): Promise<PostEntity | undefined> {
    return await this.saveAndReload({
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
  }
  async saveFromJson(
    sessionId: string,
    userId: string,
    post: JsonPost
  ): Promise<PostEntity | undefined> {
    const session = await this.manager.findOne(SessionEntity, sessionId);
    if (session) {
      return await this.saveAndReload({
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
      const sessionRepository =
        this.manager.getCustomRepository(SessionRepository);
      const newSession = {
        ...defaultSession,
        id: sessionId,
      };
      await sessionRepository.saveFromJson(newSession, userId);
      return await this.saveFromJson(sessionId, userId, cloneDeep(post));
    }
  }
}
