import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import type { Currency, User, UserIdentity } from '../../common/index.js';
import type { AccountType } from '../../common/types.js';

import type { UserIds } from '../../utils.js';
import SessionEntity from './Session.js';
import SessionTemplateEntity from './SessionTemplate.js';
import TrackingEntity from './TrackingEntity.js';

export const ALL_FIELDS: Array<keyof UserEntity> = [
  'id',
  'name',
  'email',
  'language',
  'defaultTemplate',
  'stripeId',
  'created',
  'updated',
  'trial',
  'quota',
];

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column()
  @Index()
  public name: string;
  @Column({ nullable: true, type: 'character varying' })
  @Index({ unique: true })
  public email: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public currency: Currency | null;
  @Column({ nullable: true, type: 'character varying' })
  public photo: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public stripeId: string | null;
  @Column({ type: 'timestamp with time zone', nullable: true })
  public trial: Date | null;
  @Column({ nullable: false, default: 50 })
  public quota: number;
  @Column({ nullable: true, type: 'character varying' })
  public language: string | null;
  @ManyToOne(() => SessionTemplateEntity, { nullable: true, eager: false })
  @Index()
  public defaultTemplate: SessionTemplateEntity | null | undefined;
  @ManyToMany(
    () => SessionEntity,
    (session) => session.visitors,
    {
      eager: false,
    },
  )
  public sessions: SessionEntity[] | undefined;
  @Column(() => TrackingEntity)
  public tracking: TrackingEntity;
  @Column({ nullable: true, type: 'character varying' })
  public slackUserId: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public slackTeamId: string | null;
  @CreateDateColumn({ type: 'timestamp with time zone', select: false })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone', select: false })
  public updated: Date | undefined;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.email = null;
    this.language = null;
    this.stripeId = null;
    this.currency = null;
    this.trial = null;
    this.quota = 50;
    this.slackTeamId = null;
    this.slackUserId = null;
    this.photo = null;
    this.tracking = new TrackingEntity();
  }

  toJson(): User {
    return {
      id: this.id,
      name: this.name,
      photo: this.photo,
      email: this.email,
    };
  }
}

export const ALL_IDENTITY_FIELDS: Array<keyof UserIdentityEntity> = [
  'id',
  'accountType',
  'username',
  'password',
  'emailVerification',
  'created',
  'updated',
];

@Entity({ name: 'users_identities' })
@Index(['username', 'accountType'], { unique: true })
export class UserIdentityEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => UserEntity, {
    nullable: true,
    eager: true,
    cascade: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index()
  public user: UserEntity;
  @Column({ default: 'anonymous', type: 'character varying' })
  public accountType: AccountType;
  @Column({ nullable: true, type: 'character varying' })
  public username: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public password: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public emailVerification: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public photo: string | null;
  @CreateDateColumn({ type: 'timestamp with time zone', select: false })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone', select: false })
  public updated: Date | undefined;
  constructor(id: string, user: UserEntity, password?: string) {
    this.id = id;
    this.user = user;
    this.password = password || null;
    this.accountType = 'anonymous';
    this.username = null;
    this.emailVerification = null;
    this.photo = null;
  }

  toJson(): UserIdentity {
    return {
      id: this.id,
      username: this.username,
      accountType: this.accountType,
      photo: this.photo,
    };
  }

  toIds(): UserIds {
    return {
      identityId: this.id,
      userId: this.user.id,
    };
  }
}
