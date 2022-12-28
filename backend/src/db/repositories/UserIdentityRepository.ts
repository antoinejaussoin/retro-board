import { UserIdentityEntity } from '../entities/index.js';
import { getBaseRepository } from './BaseRepository.js';

export default getBaseRepository(UserIdentityEntity).extend({});
