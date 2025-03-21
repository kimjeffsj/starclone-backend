import { z } from "zod";

export const uploadMediaSchema = z.object({
  postId: z.string().uuid("Invalid post ID format").optional(),
  type: z.enum(["profile", "post"], {
    errorMap: () => ({ message: "Type must be either 'profile' or 'post'" }),
  }),
  resize: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      quality: z.number().min(1).max(100).optional(),
    })
    .optional(),
});

export const deleteMediaSchema = z.object({
  mediaId: z.string().uuid("Invalid media Id format"),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;
