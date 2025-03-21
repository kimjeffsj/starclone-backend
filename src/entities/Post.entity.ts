import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User.entity";
import { Media } from "./Media.entity";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.posts)
  user!: User;

  @Column({ nullable: true })
  caption?: string;

  @Column({ nullable: true })
  location?: string;

  @OneToMany(() => Media, (media) => media.post, { cascade: true, eager: true })
  media!: Media[];

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
