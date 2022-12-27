import { SessionEntity } from '../entities';
import { Message as JsonMessage } from '../../common';
import { cloneDeep } from 'lodash';
import { getBaseRepository, saveAndReload } from './BaseRepository';
import MessageEntity from '../entities/Message';

export default getBaseRepository(MessageEntity).extend({
  async saveFromJson(
    sessionId: string,
    userId: string,
    message: JsonMessage
  ): Promise<MessageEntity | undefined> {
    const session = await this.manager.findOne(SessionEntity, {
      where: { id: sessionId },
    });
    if (session) {
      return await saveAndReload(this, {
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
  },
});
