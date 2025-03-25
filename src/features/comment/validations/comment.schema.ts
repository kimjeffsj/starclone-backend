import { z } from "zod";

export const createCommentSchema = z.object({
  postId: z.string().uuid("Invalid post ID format"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long"),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long"),
});

export const getCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type GetCommentsQueryInput = z.infer<typeof getCommentsQuerySchema>;
