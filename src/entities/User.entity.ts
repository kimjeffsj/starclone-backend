import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Post } from "./Post.entity";
import { Like } from "./Like.entity";
import { Comment } from "./Comment.entity";
import { Follow } from "./Follow.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 30, unique: true })
  @Index()
  username!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: false })
  isPrivate!: boolean;

  @OneToMany(() => Post, (post) => post.user)
  posts?: Post[];

  @OneToMany(() => Like, (like) => like.user)
  likes?: Like[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following!: Follow[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followers!: Follow[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Helper method to return user data without sensitive info
  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
