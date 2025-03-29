import bookmarkRoutes from "./routes/bookmark.routes";
import { BookmarkController } from "./controllers/bookmark.controller";
import { BookmarkService } from "./services/bookmark.service";

export const bookmarkRouter = bookmarkRoutes;
export const bookmarkController = new BookmarkController();
export const bookmarkService = new BookmarkService();

export * from "./validations/bookmark.schema";

export default {
  router: bookmarkRoutes,
  controller: bookmarkController,
  service: bookmarkService,
};
