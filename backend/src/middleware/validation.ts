// backend/src/middleware/validation.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ResponseHandler } from "../utils/response";

export function validateRequest(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err: any) => `${err.path.join(".")}: ${err.message}`
        );
        return ResponseHandler.validationError(res, errors);
      }
      next(error);
    }
  };
}
