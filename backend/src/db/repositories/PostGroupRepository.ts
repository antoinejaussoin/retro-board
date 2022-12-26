import { PostGroupEntity } from '../entities';
import { PostGroup as JsonPostGroup } from '../../common';
import { cloneDeep } from 'lodash';
import { getBaseRepository } from './BaseRepository';

export default getBaseRepository(PostGroupEntity).extend({
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

    return await this.saveAndReload(groupWithoutPosts);
  },
});
