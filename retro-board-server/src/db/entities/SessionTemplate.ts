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
import { TemplateColumnDefinition } from './ColumnDefinition';
import { SessionOptions as JsonSessionOptions } from 'retro-board-common';
import User from './User';
import SessionOptions from './SessionOptions';

@Entity({ name: 'templates' })
export default class SessionTemplate {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column({ nullable: false, type: 'character varying' })
  @Index()
  public name: string | null;
  @ManyToOne(() => User, { eager: true, cascade: true, nullable: false })
  public createdBy: User;
  @OneToMany(
    () => TemplateColumnDefinition,
    colDef => colDef.template,
    {
      cascade: true,
      nullable: false,
      eager: false,
    }
  )
  public columns: TemplateColumnDefinition[] | undefined;
  @Column(() => SessionOptions)
  public options: SessionOptions;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  constructor(
    id: string,
    name: string | null,
    createdBy: User,
    options: Partial<JsonSessionOptions>
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.options = new SessionOptions(options);
  }
}
