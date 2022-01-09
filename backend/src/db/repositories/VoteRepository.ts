import { EntityRepository } from 'typeorm';
import { VoteEntity } from '../entities';
import { Vote as JsonVote } from '../../common';
import BaseRepository from './BaseRepository';

@EntityRepository(VoteEntity)
export default class VoteRepository extends BaseRepository<VoteEntity> {
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
  }
}
