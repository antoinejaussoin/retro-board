import { EntityRepository, Repository, getCustomRepository } from 'typeorm';
import { SessionTemplate } from '../entities';
import {
  SessionTemplate as JsonSessionTemplate,
  ColumnDefinition as JsonColumnDefinition,
  SessionOptions as JsonSessionOptions,
} from 'retro-board-common/src/types';
import { v4 } from 'uuid';
import { TemplateColumnRepository } from '.';

@EntityRepository(SessionTemplate)
export default class SessionTemplateRepository extends Repository<
  SessionTemplate
> {
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

    const columnsRepo = getCustomRepository(TemplateColumnRepository);
    const createdTemplate = await this.save(template);

    for (let i = 0; i < columns.length; i++) {
      await columnsRepo.saveFromJson(columns[i], createdTemplate.id); // TODO
    }

    return {
      ...createdTemplate,
    };
  }
}
