import { z } from "zod";
import { NextResponse } from "next/server";

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

export type CreateFamilyInput = z.infer<typeof familySchema>;

export async function validateRequest<T>(
  req: Request,
  schema: z.Schema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: NextResponse }
> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors.map(e => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      ),
    };
  }
} 