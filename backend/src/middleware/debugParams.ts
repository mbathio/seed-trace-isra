// backend/src/middleware/debugParams.ts
import { Request, Response, NextFunction } from "express";

export const debugParamsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 [DEBUG] Route:", req.method, req.path);
    console.log("🔍 [DEBUG] Query params received:", req.query);
    console.log("🔍 [DEBUG] Body received:", req.body);

    // Log spécifiquement les problèmes de status
    if (req.query.status) {
      console.log("🔍 [DEBUG] Status param:", {
        value: req.query.status,
        type: typeof req.query.status,
        isValidEnum: [
          "PENDING",
          "CERTIFIED",
          "REJECTED",
          "IN_STOCK",
          "SOLD",
          "ACTIVE",
          "DISTRIBUTED",
        ].includes(req.query.status as string),
      });
    }
  }
  next();
};
