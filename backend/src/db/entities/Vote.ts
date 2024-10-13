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
import type { VoteType, Vote, VoteExtract } from '../../common/index.js';
import PostEntity from './Post.js';
import { UserEntity } from './UserIdentity.js';

@Entity({ name: 'votes' })
export default class VoteEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @Index()
  public user: UserEntity;
  @ManyToOne(() => PostEntity, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index()
  public post: Relation<PostEntity>;
  @Column({ type: 'character varying' })
  public type: VoteType;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  toJson(): Vote {
    return {
      id: this.id,
      type: this.type,
      user: this.user.toJson(),
    };
  }

  toExtractJson(): VoteExtract {
    return {
      id: this.id,
      type: this.type,
      userName: this.user.name,
      userId: this.user.id,
    };
  }

  constructor(
    id: string,
    post: Relation<PostEntity>,
    user: UserEntity,
    type: VoteType
  ) {
    this.id = id;
    this.post = post;
    this.type = type;
    this.user = user;
  }
}
