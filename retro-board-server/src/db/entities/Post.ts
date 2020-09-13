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
import Vote from './Vote';
import PostGroup from './PostGroup';

@Entity({ name: 'posts' })
export default class Post {
  @PrimaryColumn({ primary: true, generated: false, unique: true })
  public id: string;
  @ManyToOne(() => Session, { nullable: false })
  public session: Session;
  @ManyToOne(() => PostGroup, {
    nullable: true,
    eager: true,
    cascade: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  public group: PostGroup | null;
  @Column({ default: 0 })
  public column: number;
  @Index()
  @Column({ default: LexoRank.middle().toString() })
  public rank: string;
  @Column()
  public content: string;
  @Column({ nullable: true, type: 'character varying' })
  public action: null | string;
  @Column({ nullable: true, type: 'character varying' })
  public giphy: null | string;
  @ManyToOne(() => User, { eager: true, cascade: true, nullable: false })
  public user: User;
  @OneToMany(
    () => Vote,
    vote => vote.post,
    {
      cascade: true,
      nullable: false,
      eager: true,
    }
  )
  public votes: Vote[] | undefined;
  @CreateDateColumn({ type: 'timestamp with time zone' })
  public created: Date | undefined;
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  public updated: Date | undefined;
  constructor(
    id: string,
    session: Session,
    column: number,
    content: string,
    user: User
  ) {
    this.id = id;
    this.session = session;
    this.column = column;
    this.content = content;
    this.user = user;
    this.action = null;
    this.giphy = null;
    this.group = null;
    this.rank = LexoRank.middle().toString();
  }
}
