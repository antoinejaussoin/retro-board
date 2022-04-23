import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TemplateColumnDefinitionEntity } from './ColumnDefinition';
import {
  SessionOptions as JsonSessionOptions,
  SessionTemplate,
} from '../../common';
import UserEntity from './User';
import SessionOptionsEntity from './SessionOptions';

@Entity({ name: 'templates' })
export default class SessionTemplateEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column({ nullable: false, type: 'character varying' })
  @Index()
  public name: string | null;
  @ManyToOne(() => UserEntity, { eager: true, cascade: true, nullable: false })
  @Index()
  public createdBy: UserEntity;
  @OneToMany(
    () => TemplateColumnDefinitionEntity,
    (colDef) => colDef.template,
    {
      cascade: true,
      nullable: false,
      eager: false,
    }
  )
  public columns: TemplateColumnDefinitionEntity[] | undefined;
  @Column(() => SessionOptionsEntity)
  public options: SessionOptionsEntity;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  toJson(): SessionTemplate {
    return {
      columns:
        this.columns === undefined ? [] : this.columns.map((c) => c.toJson()),
      createdBy: this.createdBy.toJson(),
      id: this.id,
      name: this.name || '', // TODO check
      options: this.options.toJson(),
    };
  }

  constructor(
    id: string,
    name: string | null,
    createdBy: UserEntity,
    options: Partial<JsonSessionOptions>
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.options = new SessionOptionsEntity(options);
  }
}
