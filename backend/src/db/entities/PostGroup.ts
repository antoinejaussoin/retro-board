import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { LexoRank } from 'lexorank';
import SessionEntity from './Session';
import UserEntity from './User';
import PostEntity from './Post';
import { PostGroup } from '../../common';

@Entity({ name: 'groups' })
export default class PostGroupEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => SessionEntity, { nullable: false })
  @Index()
  public session: SessionEntity;
  @Column({ default: 0 })
  public column: number;
  @Index()
  @Column({ default: LexoRank.middle().toString() })
  public rank: string;
  @Column()
  public label: string;
  @ManyToOne(() => UserEntity, { eager: true, cascade: true, nullable: false })
  @Index()
  public user: UserEntity;
  @OneToMany(() => PostEntity, (post) => post.session, {
    cascade: true,
    nullable: false,
    eager: false,
  })
  public posts: PostEntity[] | undefined;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  toJson(): PostGroup {
    return {
      id: this.id,
      column: this.column,
      label: this.label,
      posts: this.posts ? this.posts.map((p) => p.toJson()) : [],
      rank: this.rank,
      user: this.user.toJson(),
    };
  }

  constructor(
    id: string,
    session: SessionEntity,
    column: number,
    label: string,
    user: UserEntity
  ) {
    this.id = id;
    this.session = session;
    this.column = column;
    this.label = label;
    this.user = user;
    this.rank = LexoRank.middle().toString();
  }
}
