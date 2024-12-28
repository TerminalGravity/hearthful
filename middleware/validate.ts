import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent } from "@/lib/monitoring";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: NextResponse;
}

export async function validateRequest<T>(
  req: Request,
  schema: z.Schema<T>,
  options: {
    stripUnknown?: boolean;
    errorStatus?: number;
  } = {}
): Promise<ValidationResult<T>> {
  try {
    const body = await req.json();
    const parsed = await schema.parseAsync(body);

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      await trackEvent({
        action: "validation_error",
        category: "api",
        metadata: {
          path: req.url,
          method: req.method,
          errors: formattedErrors,
        },
      });

      return {
        success: false,
        error: NextResponse.json(
          {
            error: "Validation failed",
            details: formattedErrors,
          },
          { status: options.errorStatus || 400 }
        ),
      };
    }

    // Handle unexpected errors
    await trackEvent({
      action: "validation_unexpected_error",
      category: "error",
      metadata: {
        path: req.url,
        method: req.method,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return {
      success: false,
      error: NextResponse.json(
        { error: "Internal validation error" },
        { status: 500 }
      ),
    };
  }
} 