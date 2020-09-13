import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { LexoRank } from 'lexorank';
import Session from './Session';
import User from './User';
import Post from './Post';

@Entity({ name: 'groups' })
export default class PostGroup {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => Session, { nullable: false })
  public session: Session;
  @Column({ default: 0 })
  public column: number;
  @Index()
  @Column({ default: LexoRank.middle().toString() })
  public rank: string;
  @Column()
  public label: string;
  @ManyToOne(() => User, { eager: true, cascade: true, nullable: false })
  public user: User;
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
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;
  constructor(
    id: string,
    session: Session,
    column: number,
    label: string,
    user: User
  ) {
    this.id = id;
    this.session = session;
    this.column = column;
    this.label = label;
    this.user = user;
    this.rank = LexoRank.middle().toString();
  }
}
