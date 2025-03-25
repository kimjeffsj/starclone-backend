import followRoutes from "./routes/follow.routes";
import { FollowController } from "./controllers/follow.controller";
import { FollowService } from "./services/follow.service";

export const followRouter = followRoutes;
export const followController = new FollowController();
export const followService = new FollowService();

export * from "./validations/follow.schema";

export default {
  router: followRoutes,
  controller: followController,
  service: followService,
};
