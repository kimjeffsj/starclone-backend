import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  bio: z
    .string()
    .max(150, "Bio must be at most 150 characters")
    .optional()
    .nullable(),
  website: z.string().url("Website must be a valid URL").optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
