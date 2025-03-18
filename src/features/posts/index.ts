import postRoutes from "../posts/routes/post.routes";
import { PostController } from "./controller/post.controller";
import { PostService } from "./services/post.service";

export const postRouter = postRoutes;

export const postController = new PostController();
export const postService = new PostService();

export * from "./validations/post.schema";

export default {
  router: postRoutes,
  controller: postController,
  service: postService,
};
