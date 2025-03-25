import { AppDataSource } from "@/config/database";
import { Comment } from "@/entities/Comment.entity";
import { Post } from "@/entities/Post.entity";
import { User } from "@/entities/User.entity";
import {
  CreateCommentInput,
  GetCommentsQueryInput,
  UpdateCommentInput,
} from "../validations/comment.schema";
import { NotFoundError } from "@/utils/errors.utils";

export class CommentService {
  private commentRepository = AppDataSource.getRepository(Comment);
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Create comment
   */
  async createComment(userId: string, commentData: CreateCommentInput) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const post = await this.postRepository.findOneBy({
      id: commentData.postId,
    });
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Create comment
    const comment = this.commentRepository.create({
      content: commentData.content,
      user,
      post,
    });

    await this.commentRepository.save(comment);

    // Query to return the result
    return this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ["user"],
    });
  }

  /**
   * Query comments list of the post
   */
  async getCommentsByPost(postId: string, options: GetCommentsQueryInput) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Query comment
    const [comments, total] = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .where("comment.post.id = :postId", { postId })
      .orderBy("comment.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      comments,
      total,
      totalPages,
    };
  }

  /**
   * Update comment
   */
  async updateComment(commentId: string, updateData: UpdateCommentInput) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ["user"],
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    // updating comment
    comment.content = updateData.content;
    await this.commentRepository.save(comment);

    return comment;
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    await this.commentRepository.remove(comment);
    return true;
  }

  /**
   * Check author
   */
  async checkCommentAuthor(
    commentId: string,
    userId: string
  ): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ["user"],
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    return comment.user.id === userId;
  }
}
