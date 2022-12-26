import { VoteEntity } from '../entities';
import { Vote as JsonVote } from '../../common';
import { getBaseRepository } from './BaseRepository';

export default getBaseRepository(VoteEntity).extend({
  async saveFromJson(
    postId: string,
    userId: string,
    vote: JsonVote
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
