import { addSeconds } from 'date-fns';
import SessionRepository from '../repositories/SessionRepository.js';
import { transaction } from './transaction.js';

export async function startTimer(sessionId: string): Promise<number> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const session = await sessionRepository.findOneBy({ id: sessionId });
    if (!session) {
      throw new Error('Session not found');
    }
    const duration = session.options.timerDuration;
    session.timer = addSeconds(new Date(), duration);
    await sessionRepository.save(session);

    return duration;
  });
}

export async function stopTimer(sessionId: string): Promise<void> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const session = await sessionRepository.findOneBy({ id: sessionId });
    if (!session) {
      throw new Error('Session not found');
    }
    session.timer = null;
    await sessionRepository.save(session);
  });
}
