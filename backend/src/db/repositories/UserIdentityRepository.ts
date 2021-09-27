import { EntityRepository } from 'typeorm';
import UserIdentityEntity from '../entities/UserIdentity';
import BaseRepository from './BaseRepository';

@EntityRepository(UserIdentityEntity)
export default class UserIdentityRepository extends BaseRepository<UserIdentityEntity> {}
