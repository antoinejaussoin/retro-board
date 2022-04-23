import { EntityRepository } from 'typeorm';
import LicenceEntity from '../entities/Licence';
import BaseRepository from './BaseRepository.js';

@EntityRepository(LicenceEntity)
export default class LicenceRepository extends BaseRepository<LicenceEntity> {}
