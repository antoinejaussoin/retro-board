import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Relation } from 'typeorm';
import SessionEntity from './Session.js';
import type { Message } from '../../common/index.js';
import { UserEntity } from './UserIdentity.js';

@Entity({ name: 'messages' })
export default class MessageEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => SessionEntity, { nullable: false })
  @Index()
  public session: Relation<SessionEntity>;
  @Column()
  public content: string;
  @ManyToOne(() => UserEntity, { eager: true, cascade: true, nullable: false })
  @Index()
  public user: UserEntity;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  toJson(): Message {
    return {
      id: this.id,
      content: this.content,
      user: this.user.toJson(),
      created: this.created || new Date(),
    };
  }

  constructor(
    id: string,
    session: Relation<SessionEntity>,
    content: string,
    user: UserEntity,
  ) {
    this.id = id;
    this.session = session;
    this.content = content;
    this.user = user;
  }
}
