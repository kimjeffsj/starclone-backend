import postRoutes from "../posts/routes/post.routes";
import { PostService } from "./services/post.service";

export const postService = new PostService();

export const postRouter = postRoutes;
