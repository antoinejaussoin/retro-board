import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'licences' })
export default class LicenceEntity {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @Column({ nullable: false })
  public email: string;
  @Column({ nullable: false })
  public key: string;
  @CreateDateColumn({ type: 'timestamp with time zone', select: false })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone', select: false })
  public updated: Date | undefined;
  constructor(id: string, email: string, key: string) {
    this.id = id;
    this.email = email;
    this.key = key;
  }
}
