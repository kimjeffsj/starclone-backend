import { z } from "zod";

// Create post validation
export const createPostSchema = z.object({
  caption: z
    .string()
    .min(1)
    .max(2200, "Caption is too long (maximum 2200 characters"),
  location: z.string().min(1).max(100).optional(),
});

// Update post validation
export const updatePostSchema = z
  .object({
    caption: z
      .string()
      .min(1)
      .max(2200, "Caption is too long (maximum 2200 characters")
      .optional(),
    location: z.string().min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At lease one field must be provided to update post",
  });

// Query post validation
export const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),

  userId: z.string().uuid().optional(),

  sortBy: z.enum(["createdAt", "likeCount"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type createPostInput = z.infer<typeof createPostSchema>;
export type updatePostInput = z.infer<typeof updatePostSchema>;
export type getPostsQueryInput = z.infer<typeof getPostsQuerySchema>;
