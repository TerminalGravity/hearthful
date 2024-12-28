import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

/**
 * Validates the incoming request against the provided Zod schema.
 * @param req - The Next.js request object.
 * @param schema - The Zod schema to validate against.
 * @param options - Optional validation options.
 * @returns An object containing the validation result.
 */
export async function validateRequest(
  req: NextRequest,
  schema: ZodSchema<any>,
  options?: {
    stripUnknown?: boolean;
    errorStatus?: number;
  }
) {
  try {
    const body = await req.json();
    const validatedData = schema.parse(body);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return {
        success: false,
        error: NextResponse.json(
          { error: error.errors },
          { status: options?.errorStatus || 400 }
        ),
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { error: "Invalid request" },
        { status: options?.errorStatus || 400 }
      ),
    };
  }
}
