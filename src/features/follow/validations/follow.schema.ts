import { z } from "zod";

export const followUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export type FollowUserInput = z.infer<typeof followUserSchema>;
