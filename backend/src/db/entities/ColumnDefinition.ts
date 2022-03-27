import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ColumnDefinition, ColumnDefinitionType } from '../../common';
import SessionEntity from './Session';
import SessionTemplateEntity from './SessionTemplate';

class ColumnDefinitionEntityBase {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column()
  public type: string;
  @Column()
  public index: number;
  @Column()
  public label: string;
  @Column()
  public color: string;
  @Column({ nullable: true, type: 'character varying' })
  public icon: string | null;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  toJson(): ColumnDefinition {
    return {
      color: this.color,
      icon: this.icon,
      id: this.id,
      index: this.index,
      label: this.label,
      type: this.type as ColumnDefinitionType,
    };
  }

  constructor(
    id: string,
    type: string,
    index: number,
    label: string,
    color: string,
    icon?: string | null
  ) {
    this.id = id;
    this.type = type;
    this.index = index;
    this.label = label;
    this.color = color;
    this.icon = icon || null;
  }
}

@Entity({ name: 'columns' })
export class ColumnDefinitionEntity extends ColumnDefinitionEntityBase {
  @ManyToOne(() => SessionEntity, { nullable: false })
  @Index()
  public session: SessionEntity;
  constructor(
    id: string,
    session: SessionEntity,
    type: string,
    index: number,
    label: string,
    color: string,
    icon?: string | null
  ) {
    super(id, type, index, label, color, icon);
    this.session = session;
  }
}

@Entity({ name: 'templates_columns' })
export class TemplateColumnDefinitionEntity extends ColumnDefinitionEntityBase {
  @ManyToOne(() => SessionTemplateEntity, { nullable: false })
  @Index()
  public template: SessionTemplateEntity;
  constructor(
    id: string,
    template: SessionTemplateEntity,
    type: string,
    index: number,
    label: string,
    color: string,
    icon?: string | null
  ) {
    super(id, type, index, label, color, icon);
    this.template = template;
  }
}
