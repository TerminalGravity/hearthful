import { z } from "zod";

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  userId: z.string().optional(),
  cuisinePreferences: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
  drinkPreferences: z.array(z.string()).default([]),
  gamePreferences: z.array(z.string()).default([]),
  additionalNotes: z.string().optional(),
});

export const familySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  members: z.array(memberSchema),
});

export const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  cuisinePreferences: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  drinkPreferences: z.array(z.string()).optional(),
  gamePreferences: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
}); 