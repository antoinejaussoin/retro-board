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
import type { CoachRole } from '../../common/index.js';
import AiChatEntity from './AiChat.js';

@Entity({ name: 'ai_chat_messages' })
export default class AiChatMessageEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => AiChatEntity, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index()
  public chat: Relation<AiChatEntity>;
  @Column({ type: 'character varying' })
  public role: CoachRole;
  @Column()
  public content: string;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  constructor(
    id: string,
    chat: Relation<AiChatEntity>,
    content: string,
    role: CoachRole,
  ) {
    this.id = id;
    this.chat = chat;
    this.content = content;
    this.role = role;
  }
}
