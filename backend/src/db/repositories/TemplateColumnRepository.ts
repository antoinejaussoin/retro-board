import { TemplateColumnDefinitionEntity } from '../entities';
import { ColumnDefinition as JsonColumnDefinition } from '../../common';
import { v4 } from 'uuid';
import { getBaseRepository } from './BaseRepository';

export default getBaseRepository(TemplateColumnDefinitionEntity).extend({
  async saveFromJson(
    colDef: JsonColumnDefinition,
    templateId: string
  ): Promise<void> {
    await this.save({
      ...colDef,
      id: colDef.id || v4(),
      template: { id: templateId },
    });
  },
});
