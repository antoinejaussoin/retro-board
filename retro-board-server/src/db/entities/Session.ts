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
import Post from './Post';
import { ColumnDefinition } from './ColumnDefinition';
import { SessionOptions as JsonSessionOptions } from 'retro-board-common';
import User from './User';
import SessionOptions from './SessionOptions';
import PostGroup from './PostGroup';

@Entity({ name: 'sessions' })
export default class Session {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column({ nullable: true, type: 'character varying' })
  @Index()
  public name: string | null;
  @ManyToOne(() => User, { eager: true, cascade: true, nullable: false })
  public createdBy: User;
  @OneToMany(
    () => Post,
    post => post.session,
    {
      cascade: true,
      nullable: false,
      eager: false,
    }
  )
  public posts: Post[] | undefined;
  @OneToMany(
    () => PostGroup,
    group => group.session,
    {
      cascade: true,
      nullable: false,
      eager: false,
    }
  )
  public groups: PostGroup[] | undefined;
  @OneToMany(
    () => ColumnDefinition,
    colDef => colDef.session,
    {
      cascade: true,
      nullable: false,
      eager: false,
    }
  )
  public columns: ColumnDefinition[] | undefined;
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
