import { EntityRepository } from 'typeorm';
import { SessionTemplateEntity } from '../entities';
import {
  SessionTemplate as JsonSessionTemplate,
  ColumnDefinition as JsonColumnDefinition,
  SessionOptions as JsonSessionOptions,
} from '../../common';
import { v4 } from 'uuid';
import { TemplateColumnRepository } from '.';
import BaseRepository from './BaseRepository';

@EntityRepository(SessionTemplateEntity)
export default class SessionTemplateRepository extends BaseRepository<SessionTemplateEntity> {
  async saveFromJson(
    name: string,
    columns: JsonColumnDefinition[],
    options: JsonSessionOptions,
    authorId: string
  ): Promise<JsonSessionTemplate> {
    const template = {
      id: v4(),
      name,
      columns,
      options,
      createdBy: { id: authorId },
    };

    const columnsRepo = this.manager.getCustomRepository(
      TemplateColumnRepository
    );
    const createdTemplate = await this.save(template);

    const reloadedTemplate = await this.findOne(createdTemplate.id);
    if (reloadedTemplate) {
      for (let i = 0; i < columns.length; i++) {
        await columnsRepo.saveFromJson(columns[i], createdTemplate.id);
      }
      return {
        ...createdTemplate,
        createdBy: reloadedTemplate.createdBy.toJson(),
      };
    }

    throw Error('Cannot save template');
  }
}
