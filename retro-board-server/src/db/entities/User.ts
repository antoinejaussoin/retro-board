import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'users' })
export default class User {
  @PrimaryColumn({ primary: true, generated: false })
  public id: string;
  @Column()
  @Index()
  public name: string;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
