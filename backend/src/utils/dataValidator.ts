import { z } from "zod";
import { logger } from "./logger";

export class DataValidator {
  // Validation batch pour plusieurs entités
  static async validateBatch<T>(
    items: T[],
    schema: z.ZodSchema<T>,
    options?: {
      stopOnFirstError?: boolean;
      maxErrors?: number;
    }
  ): Promise<{
    valid: T[];
    invalid: Array<{ item: T; errors: string[] }>;
  }> {
    const valid: T[] = [];
    const invalid: Array<{ item: T; errors: string[] }> = [];
    const maxErrors = options?.maxErrors || 100;

    for (const item of items) {
      if (options?.stopOnFirstError && invalid.length > 0) break;
      if (invalid.length >= maxErrors) break;

      try {
        const validated = schema.parse(item);
        valid.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          invalid.push({
            item,
            errors: error.errors.map(
              (e) => `${e.path.join(".")}: ${e.message}`
            ),
          });
        }
      }
    }

    if (invalid.length > 0) {
      logger.warn(
        `Batch validation failed: ${invalid.length}/${items.length} items invalid`
      );
    }

    return { valid, invalid };
  }

  static createConditionalValidator<T>(
    baseSchema: z.ZodSchema<T>,
    conditions: Array<{
      when: (data: any) => boolean;
      then: (schema: z.ZodSchema<T>) => z.ZodSchema<T>;
    }>
  ): z.ZodSchema<T> {
    return baseSchema.superRefine((data, ctx) => {
      let currentSchema = baseSchema;

      for (const condition of conditions) {
        if (condition.when(data)) {
          currentSchema = condition.then(currentSchema);
        }
      }

      // Valider avec le schéma conditionnel
      const result = currentSchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue(issue);
        });
      }
    }) as z.ZodSchema<T>;
  }

  static createSanitizingValidator<T>(
    schema: z.ZodSchema<T>,
    sanitizers: Record<string, (value: any) => any>
  ): z.ZodSchema<T> {
    return z.preprocess((data) => {
      if (typeof data !== "object" || !data) return data;

      const sanitized: Record<string, any> = {
        ...(data as Record<string, any>),
      };

      for (const [field, sanitizer] of Object.entries(sanitizers)) {
        if (field in sanitized) {
          sanitized[field] = sanitizer(sanitized[field]);
        }
      }

      return sanitized;
    }, schema) as z.ZodSchema<T>;
  }
}
