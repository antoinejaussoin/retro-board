import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { User, Currency } from '../../common';
import { SessionEntity, SessionTemplateEntity } from '.';
import UserIdentityEntity from './UserIdentity';

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
export default class UserEntity {
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
  @ManyToMany(() => SessionEntity, (session) => session.visitors, {
    eager: false,
  })
  public sessions: SessionEntity[] | undefined;
  @OneToMany(() => UserIdentityEntity, (identity) => identity.user, {
    cascade: true,
    nullable: false,
    eager: false,
  })
  public identities: UserIdentityEntity[] | undefined;
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
  }

  toJson(): User {
    return {
      id: this.id,
      name: this.name,
      photo: this.photo,
    };
  }
}
