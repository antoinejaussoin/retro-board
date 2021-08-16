import { EntityRepository, Repository } from 'typeorm';
import UserIdentityEntity from '../entities/UserIdentity';

@EntityRepository(UserIdentityEntity)
export default class UserIdentityRepository extends Repository<UserIdentityEntity> {}
