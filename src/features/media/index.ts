import mediaRoutes from "./routes/media.routes";
import { MediaController } from "./controllers/media.controller";
import { MediaService } from "./services/media.service";

export const mediaRouter = mediaRoutes;
export const mediaController = new MediaController();
export const mediaService = new MediaService();

export * from "./validations/media.schema";

export default {
  router: mediaRoutes,
  controller: mediaController,
  service: mediaService,
};
