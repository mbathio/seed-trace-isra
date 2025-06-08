import { Request, Response, NextFunction } from "express";
import { EncryptionService } from "../utils/encryption";
import { ResponseHandler } from "../utils/response";
import { prisma } from "../config/database";
import { JwtPayload } from "../types/api";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    // ✅ CORRECTION: Vérifier l'en-tête d'autorisation
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("Aucun en-tête d'autorisation fourni");
      return ResponseHandler.unauthorized(res, "Token d'accès requis");
    }

    if (!authHeader.startsWith("Bearer ")) {
      logger.warn("Format d'en-tête d'autorisation invalide:", authHeader);
      return ResponseHandler.unauthorized(res, "Format de token invalide");
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    if (!token || token.trim() === "") {
      logger.warn("Token vide après extraction");
      return ResponseHandler.unauthorized(res, "Token d'accès requis");
    }

    try {
      // ✅ CORRECTION: Vérifier le token avec gestion d'erreur améliorée
      const decoded = EncryptionService.verifyToken(token);

      if (!decoded || !decoded.userId) {
        logger.warn("Token décodé invalide:", decoded);
        return ResponseHandler.unauthorized(res, "Token invalide");
      }

      // ✅ CORRECTION: Vérifier que l'utilisateur existe et est actif
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId, isActive: true },
        select: { id: true, email: true, role: true, name: true },
      });

      if (!user) {
        logger.warn("Utilisateur non trouvé ou inactif:", decoded.userId);
        return ResponseHandler.unauthorized(
          res,
          "Utilisateur non trouvé ou désactivé"
        );
      }

      // ✅ CORRECTION: Attacher les informations utilisateur à la requête
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      logger.debug("Utilisateur authentifié avec succès:", user.email);
      next();
    } catch (jwtError: any) {
      logger.warn("Erreur de vérification JWT:", jwtError.message);
      if (jwtError.name === "TokenExpiredError") {
        return ResponseHandler.unauthorized(res, "Token expiré");
      } else if (jwtError.name === "JsonWebTokenError") {
        return ResponseHandler.unauthorized(res, "Token invalide");
      } else {
        return ResponseHandler.unauthorized(
          res,
          "Erreur de vérification du token"
        );
      }
    }
  } catch (error: any) {
    logger.error("Erreur dans authMiddleware:", error);
    return ResponseHandler.serverError(
      res,
      "Erreur interne d'authentification"
    );
  }
}

// ✅ CORRECTION: Middleware pour les rôles avec vérification améliorée
export function requireRole(...roles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      logger.warn("Tentative d'accès sans authentification");
      return ResponseHandler.unauthorized(res, "Authentification requise");
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Accès refusé pour le rôle ${req.user.role}. Rôles requis: ${roles.join(", ")}`
      );
      return ResponseHandler.forbidden(res, "Permissions insuffisantes");
    }

    next();
  };
}
