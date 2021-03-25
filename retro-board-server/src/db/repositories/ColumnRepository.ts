import { EntityRepository, Repository } from 'typeorm';
import { ColumnDefinitionEntity } from '../entities';
import { ColumnDefinition as JsonColumnDefinition } from '@retrospected/common';
import { v4 } from 'uuid';

@EntityRepository(ColumnDefinitionEntity)
export default class ColumnDefinitionRepository extends Repository<ColumnDefinitionEntity> {
  async saveFromJson(
    colDef: JsonColumnDefinition,
    sessionId: string
  ): Promise<void> {
    if (!sessionId) {
      console.error(
        'The session ID should not be null when saving columns',
        sessionId
      );
    }
    const newColumn = {
      ...colDef,
      id: colDef.id || v4(),
      session: { id: sessionId },
    };
    await this.save(newColumn);
  }

  async updateColumns(
    sessionId: string,
    columns: JsonColumnDefinition[]
  ): Promise<JsonColumnDefinition[]> {
    await this.delete({ session: { id: sessionId } });
    const promises = columns.map((c) => this.saveFromJson(c, sessionId));
    await Promise.all(promises);
    return columns;
  }
}
