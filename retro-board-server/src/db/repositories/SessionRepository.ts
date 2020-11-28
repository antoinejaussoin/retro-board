import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import { SessionEntity } from '../entities';
import ColumnRepository from './ColumnRepository';
import { Session as JsonSession, SessionOptions } from '@retrospected/common';

@EntityRepository(SessionEntity)
export default class SessionRepository extends Repository<SessionEntity> {
  async updateOptions(
    session: JsonSession,
    options: SessionOptions
  ): Promise<SessionOptions> {
    await this.save({
      ...session,
      options,
    });
    return options;
  }
  async updateName(sessionId: string, name: string) {
    const sessionEntity = await this.findOne(sessionId);
    if (sessionEntity) {
      sessionEntity.name = name;
      await this.save(sessionEntity);
    }
  }
  async saveFromJson(
    session: Omit<JsonSession, 'createdBy'>,
    authorId: string
  ): Promise<JsonSession> {
    const sessionWithoutPosts = {
      ...session,
      posts: undefined,
      columns: undefined,
      createdBy: { id: authorId },
    };
    delete sessionWithoutPosts.posts;
    delete sessionWithoutPosts.columns;

    const columnsRepo = getCustomRepository(ColumnRepository);
    await this.save(sessionWithoutPosts);
    const createdSession = (await this.findOne(sessionWithoutPosts.id))!;
    for (let i = 0; i < session.columns.length; i++) {
      await columnsRepo.saveFromJson(session.columns[i], session.id);
    }

    return createdSession.toJson();
  }
}
