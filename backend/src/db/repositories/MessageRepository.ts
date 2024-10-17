import { SessionEntity } from '../entities/index.js';
import type { Message as JsonMessage } from '../../common/index.js';
import { cloneDeep } from 'lodash-es';
import { getBaseRepository, saveAndReload } from './BaseRepository.js';
import MessageEntity from '../entities/Message.js';

export default getBaseRepository(MessageEntity).extend({
  async saveFromJson(
    sessionId: string,
    userId: string,
    message: JsonMessage,
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
    }
    throw new Error('No session found');
  },
});
