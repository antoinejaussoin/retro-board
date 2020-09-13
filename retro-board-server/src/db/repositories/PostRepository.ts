import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import { Session, Post } from '../entities';
import SessionRepository from './SessionRepository';
import { Post as JsonPost, defaultSession } from 'retro-board-common';

@EntityRepository(Post)
export default class PostRepository extends Repository<Post> {
  async saveFromJson(
    sessionId: string,
    userId: string,
    post: JsonPost
  ): Promise<void> {
    const session = await this.manager.findOne(Session, sessionId);
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
      const sessionRepository = getCustomRepository(SessionRepository);
      const newSession = {
        ...defaultSession,
        id: sessionId,
      };
      await sessionRepository.saveFromJson(newSession, userId);
      await this.saveFromJson(sessionId, userId, post);
    }
  }
}

// function toPost(json: JsonPost, userId: string, session: Session): Post {
//   const post = new Post(json.id, session, json.column, json.content, {
//     id: userId,
//   });
//   post.votes = undefined;
//   post.action = json.action;
//   return post;
// }
