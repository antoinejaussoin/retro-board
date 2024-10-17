import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import PostEntity from './Post.js';
import { ColumnDefinitionEntity } from './ColumnDefinition.js';
import type {
  SessionOptions as JsonSessionOptions,
  Session,
} from '../../common/index.js';
import SessionOptionsEntity from './SessionOptions.js';
import PostGroupEntity from './PostGroup.js';
import MessageEntity from './Message.js';
import { UserEntity } from './UserIdentity.js';

@Entity({ name: 'sessions' })
export default class SessionEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column({ nullable: true, type: 'character varying' })
  @Index()
  public name: string | null;
  @ManyToOne(() => UserEntity, { eager: true, cascade: true, nullable: false })
  @Index()
  public createdBy: UserEntity;
  @ManyToOne(() => UserEntity, { eager: true, cascade: true, nullable: false })
  @Index()
  public moderator: UserEntity;
  @OneToMany(
    () => PostEntity,
    (post) => post.session,
    {
      cascade: true,
      nullable: false,
      eager: false,
    },
  )
  public posts: PostEntity[] | undefined;
  @OneToMany(
    () => PostGroupEntity,
    (group) => group.session,
    {
      cascade: true,
      nullable: false,
      eager: false,
    },
  )
  public groups: PostGroupEntity[] | undefined;
  @OneToMany(
    () => ColumnDefinitionEntity,
    (colDef) => colDef.session,
    {
      cascade: true,
      nullable: false,
      eager: false,
    },
  )
  public columns: ColumnDefinitionEntity[] | undefined;
  @OneToMany(
    () => MessageEntity,
    (post) => post.session,
    {
      cascade: true,
      nullable: false,
      eager: false,
    },
  )
  public messages: MessageEntity[] | undefined;
  @Column(() => SessionOptionsEntity)
  public options: SessionOptionsEntity;
  @Column({ nullable: true, type: 'character varying' })
  public encrypted: string | null;
  @ManyToMany(
    () => UserEntity,
    (user) => user.sessions,
    { eager: false },
  )
  @JoinTable({ name: 'visitors' })
  visitors: UserEntity[] | undefined;
  @Column({ default: false })
  public locked: boolean;
  @Column({ default: false })
  public demo: boolean;
  @Column({ default: null, type: 'timestamp with time zone', nullable: true })
  public timer: Date | null;
  @Column('text', { array: true, default: '{}' })
  public ready: string[];
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;

  toJson(): Session {
    return {
      columns:
        this.columns === undefined ? [] : this.columns.map((c) => c.toJson()),
      createdBy: this.createdBy.toJson(),
      moderator: this.moderator.toJson(),
      groups:
        this.groups === undefined ? [] : this.groups.map((g) => g.toJson()),
      id: this.id,
      name: this.name,
      options: this.options.toJson(),
      posts: this.posts === undefined ? [] : this.posts.map((p) => p.toJson()),
      messages:
        this.messages === undefined ? [] : this.messages.map((m) => m.toJson()),
      encrypted: this.encrypted,
      locked: this.locked,
      ready: this.ready,
      timer: this.timer,
      demo: this.demo,
    };
  }

  constructor(
    id: string,
    name: string | null,
    createdBy: UserEntity,
    options: Partial<JsonSessionOptions>,
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.moderator = createdBy;
    this.options = new SessionOptionsEntity(options);
    this.encrypted = null;
    this.locked = false;
    this.ready = [];
    this.timer = null;
    this.demo = false;
  }
}
