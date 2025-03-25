import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./User.entity";

@Entity("follows")
@Unique(["follower", "following"])
export class Follow {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.following)
  follower!: User;

  @ManyToOne(() => User, (user) => user.followers)
  following!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
