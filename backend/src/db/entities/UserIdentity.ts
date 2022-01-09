import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { AccountType, UserIdentity } from '../../common';
import UserEntity from './User';
import { UserIds } from '../../utils';

export const ALL_FIELDS: Array<keyof UserIdentityEntity> = [
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
export default class UserIdentityEntity {
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
  @Column({ default: 'anonymous' })
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
