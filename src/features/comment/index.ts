import commentRoutes from "./routes/comment.routes";
import { CommentController } from "./controllers/comment.controller";
import { CommentService } from "./services/comment.service";

export const commentRouter = commentRoutes;
export const commentController = new CommentController();
export const commentService = new CommentService();

export * from "./validations/comment.schema";

export default {
  router: commentRoutes,
  controller: commentController,
  service: commentService,
};
