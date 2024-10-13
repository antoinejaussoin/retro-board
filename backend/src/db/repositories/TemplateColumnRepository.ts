import { TemplateColumnDefinitionEntity } from '../entities/index.js';
import type { ColumnDefinition as JsonColumnDefinition } from '../../common/index.js';
import { v4 } from 'uuid';
import { getBaseRepository } from './BaseRepository.js';

export default getBaseRepository(TemplateColumnDefinitionEntity).extend({
  async saveFromJson(
    colDef: JsonColumnDefinition,
    templateId: string,
  ): Promise<void> {
    await this.save({
      ...colDef,
      id: colDef.id || v4(),
      template: { id: templateId },
    });
  },
});
