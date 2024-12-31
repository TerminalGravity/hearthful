import { z } from "zod";

export const familySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const memberSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"], {
    required_error: "Role must be either ADMIN or MEMBER",
  }),
});

export const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
}); 