// backend/src/middleware/auth.ts - ✅ CORRIGÉ (erreurs ResponseHandler résolues)
import { Request, Response, NextFunction } from "express";
import { EncryptionService } from "../utils/encryption";
import { ResponseHandler } from "../utils/response";
import { prisma } from "../config/database";
import { JwtPayload } from "../types/api";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ✅ CORRECTION: Cache en mémoire pour éviter les requêtes DB répétées
const userCache = new Map<number, { user: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedUser(userId: number) {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.user;
  }
  return null;
}

function setCachedUser(userId: number, user: any) {
  userCache.set(userId, { user, timestamp: Date.now() });

  // Nettoyer le cache périodiquement
  if (userCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        userCache.delete(key);
      }
    }
  }
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    // ✅ CORRECTION: Vérification améliorée de l'en-tête d'autorisation
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.debug("Tentative d'accès sans en-tête d'autorisation", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.originalUrl,
      });
      return ResponseHandler.unauthorized(res, "Token d'accès requis");
    }

    // ✅ CORRECTION: Validation du format Bearer plus stricte
    const bearerPattern = /^Bearer\s+(.+)$/;
    const match = authHeader.match(bearerPattern);

    if (!match) {
      logger.warn("Format d'en-tête d'autorisation invalide", {
        authHeader: authHeader.substring(0, 20) + "...", // Log partiel pour sécurité
        ip: req.ip,
      });
      return ResponseHandler.unauthorized(res, "Format de token invalide");
    }

    const token = match[1];

    if (!token || token.trim() === "") {
      logger.warn("Token vide après extraction", { ip: req.ip });
      return ResponseHandler.unauthorized(res, "Token d'accès requis");
    }

    try {
      // ✅ CORRECTION: Vérification du token avec gestion d'erreur détaillée
      const decoded = EncryptionService.verifyToken(token);

      if (!decoded || !decoded.userId) {
        logger.warn("Token décodé invalide", {
          decoded: decoded
            ? { userId: decoded.userId, email: decoded.email }
            : null,
          ip: req.ip,
        });
        return ResponseHandler.unauthorized(res, "Token invalide");
      }

      // ✅ CORRECTION: Vérifier le cache utilisateur d'abord
      let user = getCachedUser(decoded.userId);

      if (!user) {
        // ✅ CORRECTION: Requête DB optimisée avec gestion d'erreur
        user = await prisma.user.findUnique({
          where: { id: decoded.userId, isActive: true },
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
            isActive: true,
            updatedAt: true, // Pour détecter les changements
          },
        });

        if (!user) {
          logger.warn("Utilisateur non trouvé ou inactif", {
            userId: decoded.userId,
            ip: req.ip,
          });
          return ResponseHandler.unauthorized(
            res,
            "Utilisateur non trouvé ou désactivé"
          );
        }

        // Mettre en cache l'utilisateur
        setCachedUser(decoded.userId, user);
      }

      // ✅ CORRECTION: Vérification supplémentaire de l'état actif
      if (!user.isActive) {
        logger.warn("Tentative d'accès avec compte désactivé", {
          userId: user.id,
          email: user.email,
          ip: req.ip,
        });
        return ResponseHandler.unauthorized(res, "Compte désactivé");
      }

      // ✅ CORRECTION: Attacher les informations utilisateur complètes à la requête
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      logger.debug("Utilisateur authentifié avec succès", {
        userId: user.id,
        email: user.email,
        role: user.role,
        ip: req.ip,
      });

      next();
    } catch (jwtError: any) {
      // ✅ CORRECTION: Gestion détaillée des erreurs JWT avec ResponseHandler correct
      logger.warn("Erreur de vérification JWT", {
        error: jwtError.message,
        name: jwtError.name,
        ip: req.ip,
        tokenPreview: token.substring(0, 20) + "...", // Log partiel pour debug
      });

      if (jwtError.name === "TokenExpiredError") {
        return ResponseHandler.unauthorized(res, "Token expiré");
      } else if (jwtError.name === "JsonWebTokenError") {
        return ResponseHandler.unauthorized(res, "Token invalide");
      } else if (jwtError.name === "NotBeforeError") {
        return ResponseHandler.unauthorized(res, "Token pas encore valide");
      } else {
        return ResponseHandler.unauthorized(
          res,
          "Erreur de vérification du token"
        );
      }
    }
  } catch (error: any) {
    // ✅ CORRECTION: Gestion d'erreur globale améliorée
    logger.error("Erreur critique dans authMiddleware", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      url: req.originalUrl,
    });

    return ResponseHandler.serverError(
      res,
      "Erreur interne d'authentification"
    );
  }
}

// ✅ CORRECTION: Middleware pour les rôles avec validation améliorée
export function requireRole(...allowedRoles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    // ✅ CORRECTION: Validation que l'utilisateur est authentifié
    if (!req.user) {
      logger.warn(
        "Tentative d'accès avec autorisation de rôle sans authentification",
        {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
        }
      );
      return ResponseHandler.unauthorized(res, "Authentification requise");
    }

    // ✅ CORRECTION: Validation que les rôles sont fournis
    if (!allowedRoles || allowedRoles.length === 0) {
      logger.error("requireRole appelé sans rôles spécifiés", {
        url: req.originalUrl,
        method: req.method,
      });
      return ResponseHandler.serverError(
        res,
        "Configuration d'autorisation invalide"
      );
    }

    // ✅ CORRECTION: Validation du rôle utilisateur
    if (!req.user.role) {
      logger.warn("Utilisateur sans rôle défini", {
        userId: req.user.userId,
        email: req.user.email,
        ip: req.ip,
      });
      return ResponseHandler.forbidden(res, "Rôle utilisateur non défini");
    }

    // ✅ CORRECTION: Vérification d'autorisation avec logging et ResponseHandler correct
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("Accès refusé - rôle insuffisant", {
        userId: req.user.userId,
        email: req.user.email,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
      });

      return ResponseHandler.forbidden(
        res,
        `Accès interdit. Rôles requis: ${allowedRoles.join(", ")}`
      );
    }

    logger.debug("Autorisation de rôle réussie", {
      userId: req.user.userId,
      userRole: req.user.role,
      requiredRoles: allowedRoles,
      url: req.originalUrl,
    });

    next();
  };
}

// ✅ CORRECTION: Middleware optionnel pour les routes publiques avec contexte utilisateur
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Pas d'authentification, continuer sans utilisateur
    logger.debug(
      "Pas de token d'authentification fourni pour la route optionnelle",
      {
        url: req.originalUrl,
        method: req.method,
      }
    );
    next();
    return;
  }

  // Tenter l'authentification sans bloquer si elle échoue
  authMiddleware(req, res, (error?: any) => {
    if (error) {
      // Ignorer l'erreur et continuer sans authentification
      logger.debug(
        "Authentification optionnelle échouée, continuation sans authentification",
        {
          error: error.message,
          url: req.originalUrl,
          method: req.method,
        }
      );
      // S'assurer que req.user n'est pas défini en cas d'échec
      delete (req as any).user;
    }
    next();
  });
}

// ✅ CORRECTION: Middleware pour vérifier la propriété des ressources
export function requireOwnership(
  getResourceUserId: (req: Request) => Promise<number | null>
) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, "Authentification requise");
    }

    try {
      const resourceUserId = await getResourceUserId(req);

      if (resourceUserId === null) {
        return ResponseHandler.notFound(res, "Ressource non trouvée");
      }

      // Les admins et managers peuvent accéder à toutes les ressources
      if (["ADMIN", "MANAGER"].includes(req.user.role)) {
        next();
        return;
      }

      // Vérifier la propriété
      if (req.user.userId !== resourceUserId) {
        logger.warn("Tentative d'accès à une ressource non autorisée", {
          userId: req.user.userId,
          resourceUserId,
          ip: req.ip,
          url: req.originalUrl,
        });

        return ResponseHandler.forbidden(
          res,
          "Vous ne pouvez accéder qu'à vos propres ressources"
        );
      }

      next();
    } catch (error) {
      logger.error("Erreur lors de la vérification de propriété", {
        error,
        userId: req.user.userId,
        ip: req.ip,
      });
      return ResponseHandler.serverError(
        res,
        "Erreur de vérification d'autorisation"
      );
    }
  };
}

// ✅ CORRECTION: Utilitaire pour nettoyer le cache périodiquement
export function clearUserCache(): void {
  userCache.clear();
  logger.info("Cache utilisateur nettoyé");
}

// ✅ CORRECTION: Nettoyer le cache toutes les heures
setInterval(clearUserCache, 60 * 60 * 1000);
