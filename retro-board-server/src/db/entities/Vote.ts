import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VoteType } from 'retro-board-common';
import User from './User';
import Post from './Post';

@Entity({ name: 'votes' })
export default class Vote {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => User, { eager: true, nullable: false })
  public user: User;
  @ManyToOne(() => Post, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public post: Post;
  @Column({ type: 'character varying' })
  public type: VoteType;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;
  constructor(id: string, post: Post, user: User, type: VoteType) {
    this.id = id;
    this.post = post;
    this.type = type;
    this.user = user;
  }
}
