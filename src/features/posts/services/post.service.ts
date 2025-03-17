import { AppDataSource } from "@/config/database";
import { Post } from "@/entities/Post.entity";
import { User } from "@/entities/User.entity";
import { createPostInput } from "../validations/post.schema";
import { NotFoundError } from "@/utils/errors.utils";

export class PostService {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  // Create Post
  async createPost(userId: string, postData: createPostInput) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const newPost = this.postRepository.create({
      ...postData,
      user,
    });

    await this.postRepository.save(newPost);
    return newPost;
  }
}
