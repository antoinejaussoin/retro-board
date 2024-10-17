import {
  Entity,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import AiChatMessageEntity from './AiChatMessage.js';
import { UserEntity } from './UserIdentity.js';

@Entity({ name: 'ai_chat' })
export default class AiChatEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @OneToMany(
    () => AiChatMessageEntity,
    (message) => message.chat,
    {
      cascade: true,
      nullable: false,
      eager: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  public messages: AiChatMessageEntity[] | undefined;
  @ManyToOne(() => UserEntity, {
    eager: true,
    cascade: true,
    nullable: false,
  })
  @Index()
  public createdBy: UserEntity;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  constructor(id: string, createdBy: UserEntity) {
    this.id = id;
    this.createdBy = createdBy;
  }
}
