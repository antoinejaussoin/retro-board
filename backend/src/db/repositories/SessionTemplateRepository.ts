import { SessionTemplateEntity } from '../entities/index.js';
import type {
  SessionTemplate as JsonSessionTemplate,
  ColumnDefinition as JsonColumnDefinition,
  SessionOptions as JsonSessionOptions,
} from '../../common/index.js';
import { v4 } from 'uuid';
import { TemplateColumnRepository } from './index.js';
import { getBaseRepository } from './BaseRepository.js';

export default getBaseRepository(SessionTemplateEntity).extend({
  async saveFromJson(
    name: string,
    columns: JsonColumnDefinition[],
    options: JsonSessionOptions,
    authorId: string,
  ): Promise<JsonSessionTemplate> {
    const template = {
      id: v4(),
      name,
      columns,
      options,
      createdBy: { id: authorId },
    };

    const columnsRepo = this.manager.withRepository(TemplateColumnRepository);
    const createdTemplate = await this.save(template);

    const reloadedTemplate = await this.findOne({
      where: { id: createdTemplate.id },
    });
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
  },
});
