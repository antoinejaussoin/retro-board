import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import type { Plan } from '../../common/index.js';
import { UserEntity } from './UserIdentity.js';

@Entity({ name: 'subscriptions' })
export default class SubscriptionEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column({ nullable: false, default: false })
  public active: boolean;
  @Column({ nullable: false, type: 'character varying' })
  public plan: Plan;
  @ManyToOne(() => UserEntity, { eager: true, cascade: true, nullable: false })
  @Index()
  public owner: UserEntity;
  @Column({ nullable: true, type: 'character varying' })
  public domain: string | null;
  @Column('text', { array: true, default: '{}' })
  public members: string[];
  @Column('text', { array: true, default: '{}' })
  public admins: string[];
  @CreateDateColumn({ type: 'timestamp with time zone', select: false })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone', select: false })
  public updated: Date | undefined;
  constructor(id: string, owner: UserEntity, plan: Plan) {
    this.id = id;
    this.owner = owner;
    this.active = true;
    this.plan = plan;
    this.domain = null;
    this.members = [];
    this.admins = [];
  }
}
