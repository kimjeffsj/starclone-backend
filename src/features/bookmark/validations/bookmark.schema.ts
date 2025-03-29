import { z } from "zod";

export const bookmarkSchema = z.object({
  postId: z.string().uuid("Invalid post ID format"),
});

export type BookmarkInput = z.infer<typeof bookmarkSchema>;
