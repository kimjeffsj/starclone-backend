import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./User.entity";
import { Post } from "./Post.entity";

@Entity("likes")
@Unique(["user", "post"]) // User can like only once each post
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.likes)
  user!: User;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: "CASCADE" })
  post!: Post;

  @CreateDateColumn()
  createdAt!: Date;
}
