import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IconName } from 'retro-board-common';
import Session from './Session';
import SessionTemplate from './SessionTemplate';

class ColumnDefinitionBase {
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
  public icon: IconName | null;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  constructor(
    id: string,
    type: string,
    index: number,
    label: string,
    color: string,
    icon?: IconName | null
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
export class ColumnDefinition extends ColumnDefinitionBase {
  @ManyToOne(() => Session, { nullable: false })
  public session: Session;
  constructor(
    id: string,
    session: Session,
    type: string,
    index: number,
    label: string,
    color: string,
    icon?: IconName | null
  ) {
    super(id, type, index, label, color, icon);
    this.session = session;
  }
}

@Entity({ name: 'templates-columns' })
export class TemplateColumnDefinition extends ColumnDefinitionBase {
  @ManyToOne(() => SessionTemplate, { nullable: false })
  public template: SessionTemplate;
  constructor(
    id: string,
    template: SessionTemplate,
    type: string,
    index: number,
    label: string,
    color: string,
    icon?: IconName | null
  ) {
    super(id, type, index, label, color, icon);
    this.template = template;
  }
}
