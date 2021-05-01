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
import { AccountType, User, Currency } from '@retrospected/common';
import { SessionEntity, SessionTemplateEntity } from '.';

export const ALL_FIELDS: Array<keyof UserEntity> = [
  'id',
  'name',
  'email',
  'accountType',
  'username',
  'password',
  'emailVerification',
  'photo',
  'language',
  'defaultTemplate',
  'stripeId',
  'created',
  'updated',
  'trial',
  'quota',
];

@Entity({ name: 'users' })
@Index(['username', 'accountType'], { unique: true })
export default class UserEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column()
  @Index()
  public name: string;
  @Column({ default: 'anonymous' })
  public accountType: AccountType;
  @Column({ nullable: true, type: 'character varying' })
  public username: string | null;
  @Column({ nullable: true, type: 'character varying', select: false })
  public password: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public email: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public currency: Currency | null;
  @Column({ nullable: true, type: 'character varying', select: false })
  public emailVerification: string | null;
  @Column({ nullable: true, type: 'character varying', select: false })
  public stripeId: string | null;
  @Column({ type: 'timestamp with time zone', nullable: true })
  public trial: Date | null;
  @Column({ nullable: false, default: 50 })
  public quota: number;
  @Column({ nullable: true, type: 'character varying' })
  public photo: string | null;
  @Column({ nullable: false, type: 'character varying', default: 'en' })
  public language: string;
  @ManyToOne(() => SessionTemplateEntity, { nullable: true, eager: false })
  public defaultTemplate: SessionTemplateEntity | null | undefined;
  @ManyToMany(() => SessionEntity, (session) => session.visitors, {
    eager: false,
  })
  public sessions: SessionEntity[] | undefined;
  @CreateDateColumn({ type: 'timestamp with time zone', select: false })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone', select: false })
  public updated: Date | undefined;
  constructor(id: string, name: string, password?: string) {
    this.id = id;
    this.name = name;
    this.password = password || null;
    this.email = null;
    this.language = 'en';
    this.accountType = 'anonymous';
    this.username = null;
    this.photo = null;
    this.emailVerification = null;
    this.stripeId = null;
    this.currency = null;
    this.trial = null;
    this.quota = 50;
  }

  toJson(): User {
    return {
      id: this.id,
      name: this.name,
      photo: this.photo,
    };
  }
}
