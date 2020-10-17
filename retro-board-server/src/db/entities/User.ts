import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { AccountType, User } from 'retro-board-common';
import { SessionTemplate } from '.';

export const ALL_FIELDS: Array<keyof UserEntity> = [
  'id',
  'name',
  'accountType',
  'username',
  'password',
  'emailVerification',
  'photo',
  'language',
  'defaultTemplate',
  'created',
  'updated',
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
  @Column({ nullable: true, type: 'character varying', select: false })
  public emailVerification: string | null;
  @Column({ nullable: true, type: 'character varying' })
  public photo: string | null;
  @Column({ nullable: false, type: 'character varying', default: 'en' })
  public language: string;
  @ManyToOne(() => SessionTemplate, { nullable: true, eager: false })
  public defaultTemplate: SessionTemplate | null | undefined;
  @CreateDateColumn({ type: 'timestamp with time zone', select: false })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone', select: false })
  public updated: Date | undefined;
  constructor(id: string, name: string, password?: string) {
    this.id = id;
    this.name = name;
    this.password = password || null;
    this.language = 'en';
    this.accountType = 'anonymous';
    this.username = null;
    this.photo = null;
    this.emailVerification = null;
  }

  toJson(): User {
    return {
      accountType: this.accountType,
      id: this.id,
      language: this.language,
      name: this.name,
      photo: this.photo,
      username: this.username,
    };
  }
}
