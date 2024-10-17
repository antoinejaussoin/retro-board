import type { CoachMessage, CoachRole } from 'common/types.js';
import { addDays } from 'date-fns';
import { MoreThanOrEqual } from 'typeorm';
import { v4 } from 'uuid';
import config from '../../config.js';
import AiChatEntity from '../entities/AiChat.js';
import AiChatMessageEntity from '../entities/AiChatMessage.js';
import type UserView from '../entities/UserView.js';
import AiChatMessageRepository from '../repositories/AiChatMessageRepository.js';
import AiChatRepository from '../repositories/AiChatRepository.js';
import { transaction } from './transaction.js';
import { getUser } from './users.js';

export async function getAiChatSession(
  id: string,
  userView: UserView,
  systemMessage: CoachMessage,
): Promise<AiChatEntity> {
  return await transaction(async (manager) => {
    const repository = manager.withRepository(AiChatRepository);
    const chat = await repository.findOne({
      where: { id },
    });
    if (chat) {
      return chat;
    }
    const user = await getUser(userView.id);
    if (user && systemMessage.content) {
      const newChat = new AiChatEntity(id, user);
      await repository.save(newChat);
      const messageRepository = manager.withRepository(AiChatMessageRepository);
      await messageRepository.save(
        new AiChatMessageEntity(
          v4(),
          newChat,
          systemMessage.content,
          systemMessage.role,
        ),
      );
      return newChat;
    }

    throw Error('Could not persist a chat session');
  });
}

export async function recordAiChatMessage(
  role: CoachRole,
  content: string | undefined,
  chat: AiChatEntity,
): Promise<void> {
  if (!content) {
    return;
  }
  return await transaction(async (manager) => {
    const repository = manager.withRepository(AiChatMessageRepository);
    await repository.save(new AiChatMessageEntity(v4(), chat, content, role));
  });
}

export async function getAllowance(user: UserView) {
  return await transaction(async (manager) => {
    const repository = manager.withRepository(AiChatMessageRepository);
    const count = await repository.count({
      where: {
        role: 'user',
        chat: {
          created: MoreThanOrEqual(addDays(new Date(), -30)),
          createdBy: {
            id: user.id,
          },
        },
      },
    });
    const allowance = user.pro
      ? config.OPEN_AI_PAID_LIMIT
      : config.OPEN_AI_FREE_LIMIT;

    return count / allowance;
  });
}
