import { VoteEntity } from '../entities/index.js';
import type { Vote as JsonVote } from '../../common/index.js';
import { getBaseRepository } from './BaseRepository.js';

export default getBaseRepository(VoteEntity).extend({
  async saveFromJson(
    postId: string,
    userId: string,
    vote: JsonVote,
  ): Promise<void> {
    try {
      await this.save({
        ...vote,
        post: {
          id: postId,
        },
        user: { id: userId },
      });
    } catch (error) {
      console.error('Error while saving a vote', error);
      throw error;
    }
  },
});
