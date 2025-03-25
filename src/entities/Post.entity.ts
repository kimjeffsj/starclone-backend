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
import { Like } from "./Like.entity";
import { Comment } from "./Comment.entity";

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

  @OneToMany(() => Like, (like) => like.post)
  likes!: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @Column({ default: 0 })
  likeCount!: number;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
