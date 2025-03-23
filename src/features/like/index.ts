import likeRoutes from "./routes/like.routes";
import { LikeController } from "./controllers/like.controller";
import { LikeService } from "./services/like.service";

export const likeRouter = likeRoutes;
export const likeController = new LikeController();
export const likeService = new LikeService();

export * from "./validations/like.schema";

export default {
  router: likeRoutes,
  controller: likeController,
  service: likeService,
};
