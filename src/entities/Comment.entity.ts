import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User.entity";
import { Post } from "./Post.entity";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.comments)
  user!: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
  post!: Post;

  @Column()
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
