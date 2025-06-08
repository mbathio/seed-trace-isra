// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { EncryptionService } from "../utils/encryption";
import { ResponseHandler } from "../utils/response";
import { prisma } from "../config/database";
import { JwtPayload } from "../types/api";
import { logger } from "../utils/logger"; // ✅ Import ajouté

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseHandler.unauthorized(res, "Token d'accès requis");
    }

    const token = authHeader.substring(7);

    try {
      const decoded = EncryptionService.verifyToken(token);

      // Vérifier que l'utilisateur existe toujours
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId, isActive: true },
        select: { id: true, email: true, role: true, name: true },
      });

      if (!user) {
        return ResponseHandler.unauthorized(
          res,
          "Utilisateur non trouvé ou désactivé"
        );
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (jwtError) {
      return ResponseHandler.unauthorized(res, "Token invalide ou expiré");
    }
  } catch (error) {
    logger.error("Erreur dans authMiddleware:", error);
    next(error);
  }
}

export function requireRole(...roles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, "Authentification requise");
    }

    if (!roles.includes(req.user.role)) {
      return ResponseHandler.forbidden(res, "Permissions insuffisantes");
    }

    next();
  };
}
