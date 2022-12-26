import { UserIdentityEntity } from '../entities';
import { getBaseRepository } from './BaseRepository';

export default getBaseRepository(UserIdentityEntity).extend({});
