import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'licences' })
export default class LicenceEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column({ nullable: true, type: 'character varying' })
  @Index()
  public email: string | null;
  @Column({ nullable: false })
  public key: string;
  @Column({ nullable: false })
  public stripeCustomerId: string;
  @Column({ nullable: false })
  public stripeSessionId: string;
  @CreateDateColumn({ type: 'timestamp with time zone', select: false })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone', select: false })
  public updated: Date | undefined;
  constructor(
    id: string,
    email: string | null,
    key: string,
    customerId: string,
    sessionId: string
  ) {
    this.id = id;
    this.email = email;
    this.key = key;
    this.stripeCustomerId = customerId;
    this.stripeSessionId = sessionId;
  }
}
