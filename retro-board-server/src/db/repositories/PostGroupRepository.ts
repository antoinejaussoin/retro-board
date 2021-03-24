import { EntityRepository, Repository } from 'typeorm';
import { PostGroupEntity } from '../entities';
import { PostGroup as JsonPostGroup } from '@retrospected/common';
import { cloneDeep } from 'lodash';

@EntityRepository(PostGroupEntity)
export default class PostGroupRepository extends Repository<PostGroupEntity> {
  async saveFromJson(
    sessionId: string,
    authorId: string,
    group: Omit<JsonPostGroup, 'createdBy'>
  ): Promise<PostGroupEntity | undefined> {
    const groupWithoutPosts = {
      ...cloneDeep(group),
      posts: undefined,
      session: { id: sessionId },
      createdBy: { id: authorId },
    };
    delete groupWithoutPosts.posts;

    await this.save(groupWithoutPosts);
    return this.findOne(groupWithoutPosts.id);
  }
}
