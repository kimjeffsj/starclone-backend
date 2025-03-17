import authRoutes from "../auth/routes/auth.routes";
import { AuthController } from "./controllers/auth.controller";
import { authenticate } from "./middlewares/auth.middleware";
import { AuthService } from "./services/auth.service";

export const authRouter = authRoutes;

export const authController = new AuthController();
export const authService = new AuthService();

export { authenticate };

export * from "./validations/auth.schema";

export default {
  router: authRoutes,
  controller: authController,
  service: authService,
  middlewares: { authenticate },
};
