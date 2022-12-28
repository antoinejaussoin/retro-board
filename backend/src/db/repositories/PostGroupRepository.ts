import { PostGroupEntity } from '../entities/index.js';
import { PostGroup as JsonPostGroup } from '../../common/index.js';
import { cloneDeep } from 'lodash-es';
import { getBaseRepository, saveAndReload } from './BaseRepository.js';

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

    return await saveAndReload(this, groupWithoutPosts);
  },
});
