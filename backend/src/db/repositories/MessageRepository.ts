import { EntityRepository } from 'typeorm';
import { SessionEntity } from '../entities';
import { Message as JsonMessage } from '../../common';
import { cloneDeep } from 'lodash';
import BaseRepository from './BaseRepository';
import MessageEntity from '../entities/Message';

@EntityRepository(MessageEntity)
export default class MessageRepository extends BaseRepository<MessageEntity> {
  async saveFromJson(
    sessionId: string,
    userId: string,
    message: JsonMessage
  ): Promise<MessageEntity | undefined> {
    const session = await this.manager.findOne(SessionEntity, sessionId);
    if (session) {
      return await this.saveAndReload({
        ...cloneDeep(message),
        user: {
          id: userId,
        },
        session: {
          id: sessionId,
        },
      });
    } else {
      throw new Error('No session found');
    }
  }
}
