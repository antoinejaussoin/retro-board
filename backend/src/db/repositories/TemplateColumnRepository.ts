import { EntityRepository } from 'typeorm';
import { TemplateColumnDefinitionEntity } from '../entities';
import { ColumnDefinition as JsonColumnDefinition } from '../../common';
import { v4 } from 'uuid';
import BaseRepository from './BaseRepository';

@EntityRepository(TemplateColumnDefinitionEntity)
export default class TemplateColumnDefinitionRepository extends BaseRepository<TemplateColumnDefinitionEntity> {
  async saveFromJson(
    colDef: JsonColumnDefinition,
    templateId: string
  ): Promise<void> {
    await this.save({
      ...colDef,
      id: colDef.id || v4(),
      template: { id: templateId },
    });
  }
}
