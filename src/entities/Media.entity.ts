import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post.entity";

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

@Entity("medias")
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Post, (post) => post.media, { onDelete: "CASCADE" })
  post!: Post;

  @Column()
  mediaUrl!: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({
    type: "enum",
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  type!: MediaType;

  @Column({ nullable: true })
  width?: number;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true })
  duration?: number;

  @CreateDateColumn()
  createdAt!: Date;
}
