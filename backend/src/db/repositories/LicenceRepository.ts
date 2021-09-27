import { EntityRepository } from 'typeorm';
import LicenceEntity from '../entities/Licence';
import BaseRepository from './BaseRepository';

@EntityRepository(LicenceEntity)
export default class LicenceRepository extends BaseRepository<LicenceEntity> {}
