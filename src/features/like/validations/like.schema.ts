import { z } from "zod";

export const likeSchema = z.object({
  postId: z.string().uuid("Invalid post ID format"),
});

export type LikeInput = z.infer<typeof likeSchema>;
