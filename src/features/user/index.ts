import userRoutes from "./routes/user.routes";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";

export const userRouter = userRoutes;
export const userController = new UserController();
export const userService = new UserService();

export * from "./validations/user.schema";

export default {
  router: userRoutes,
  controller: userController,
  service: userService,
};
