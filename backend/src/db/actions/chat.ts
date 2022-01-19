import { Message } from '../../common';
import MessageRepository from '../repositories/MessageRepository';
import { transaction } from './transaction';

export async function saveChatMessage(
  userId: string,
  sessionId: string,
  message: Message
): Promise<Message | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.getCustomRepository(MessageRepository);
    const entity = await postRepository.saveFromJson(
      sessionId,
      userId,
      message
    );
    if (entity) {
      return entity.toJson();
    }

    return null;
  });
}
