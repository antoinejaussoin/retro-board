import type { Message } from '../../common/index.js';
import MessageRepository from '../repositories/MessageRepository.js';
import { transaction } from './transaction.js';

export async function saveChatMessage(
  userId: string,
  sessionId: string,
  message: Message,
): Promise<Message | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.withRepository(MessageRepository);
    const entity = await postRepository.saveFromJson(
      sessionId,
      userId,
      message,
    );
    if (entity) {
      return entity.toJson();
    }

    return null;
  });
}
