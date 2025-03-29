import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./User.entity";
import { Post } from "./Post.entity";

@Entity("bookmarks")
@Unique(["user", "post"])
export class Bookmark {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Post, (post) => post.bookmarks, { onDelete: "CASCADE" })
  post!: Post;

  @CreateDateColumn()
  createdAt!: Date;
}
