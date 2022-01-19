import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import SessionEntity from './Session';
import UserEntity from './User';
import { Message } from '../../common';

@Entity({ name: 'messages' })
export default class MessageEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => SessionEntity, { nullable: false })
  @Index()
  public session: SessionEntity;
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
    session: SessionEntity,
    content: string,
    user: UserEntity
  ) {
    this.id = id;
    this.session = session;
    this.content = content;
    this.user = user;
  }
}
