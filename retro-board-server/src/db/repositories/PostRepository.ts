import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import { Session, Post } from '../entities';
import SessionRepository from './SessionRepository';
import { Post as JsonPost, defaultSession } from 'retro-board-common';

@EntityRepository(Post)
export default class PostRepository extends Repository<Post> {
  async saveFromJson(sessionId: string, post: JsonPost): Promise<void> {
    const session = await this.manager.findOne(Session, sessionId);
    if (session) {
      await this.save(toPost(post, session));
    } else {
      const sessionRepository = getCustomRepository(SessionRepository);
      const newSession = {
        ...defaultSession,
        id: sessionId,
      };
      await sessionRepository.saveFromJson(newSession);
      await this.saveFromJson(sessionId, post);
    }
  }
}

function toPost(json: JsonPost, session: Session): Post {
  const post = new Post(json.id, session, json.column, json.content, json.user);
  post.votes = undefined;
  post.action = json.action;
  return post;
}
