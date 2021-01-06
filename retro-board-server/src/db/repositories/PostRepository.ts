import { EntityRepository, Repository } from 'typeorm';
import { SessionEntity, PostEntity } from '../entities';
import SessionRepository from './SessionRepository';
import { Post as JsonPost, defaultSession } from '@retrospected/common';

@EntityRepository(PostEntity)
export default class PostRepository extends Repository<PostEntity> {
  async saveFromJson(
    sessionId: string,
    userId: string,
    post: JsonPost
  ): Promise<void> {
    const session = await this.manager.findOne(SessionEntity, sessionId);
    if (session) {
      await this.save({
        ...post,
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
      const sessionRepository = this.manager.getCustomRepository(
        SessionRepository
      );
      const newSession = {
        ...defaultSession,
        id: sessionId,
      };
      await sessionRepository.saveFromJson(newSession, userId);
      await this.saveFromJson(sessionId, userId, post);
    }
  }
}
