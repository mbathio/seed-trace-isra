import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../config/database";
import { EncryptionService } from "../utils/encryption";
import { ResponseHandler } from "../utils/response";
import { JwtPayload } from "../types/api";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

interface EnsureAuthOptions {
  silent?: boolean;
}

async function ensureAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  { silent = false }: EnsureAuthOptions = {}
): Promise<boolean> {
  if (req.user) {
    return true;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.debug("Missing bearer token", {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    if (!silent) {
      ResponseHandler.unauthorized(res, "Token d'accès requis");
    }

    return false;
  }

  const token = authHeader.substring("Bearer ".length).trim();

  if (!token) {
    if (!silent) {
      ResponseHandler.unauthorized(res, "Token d'accès requis");
    }
    return false;
  }

  try {
    const payload = EncryptionService.verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      logger.warn("Authenticated user not found or inactive", {
        userId: payload.userId,
        url: req.originalUrl,
      });

      if (!silent) {
        ResponseHandler.unauthorized(res, "Utilisateur non autorisé");
      }

      return false;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return true;
  } catch (error) {
    logger.warn("Failed to verify access token", {
      error: error instanceof Error ? error.message : error,
      url: req.originalUrl,
    });

    if (!silent) {
      ResponseHandler.unauthorized(res, "Token invalide ou expiré");
    }

    return false;
  }
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const isAuthenticated = await ensureAuthenticated(req, res);

  if (!isAuthenticated) {
    return;
  }

  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const isAuthenticated = await ensureAuthenticated(req, res);

    if (!isAuthenticated) {
      return;
    }

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn("Insufficient role for resource", {
        userId: req.user?.userId,
        userRole: req.user?.role,
        requiredRoles: allowedRoles,
        url: req.originalUrl,
      });

      return ResponseHandler.forbidden(
        res,
        `Accès interdit. Rôles requis: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  ensureAuthenticated(req, res, { silent: true })
    .catch((error) => {
      logger.debug("Optional authentication failed", {
        error: error instanceof Error ? error.message : error,
        url: req.originalUrl,
      });
    })
    .finally(() => {
      next();
    });
}

export function requireOwnership(
  getResourceUserId: (req: Request) => Promise<number | null>
) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const isAuthenticated = await ensureAuthenticated(req, res);

    if (!isAuthenticated || !req.user) {
      return;
    }

    try {
      const ownerId = await getResourceUserId(req);

      if (ownerId === null) {
        return ResponseHandler.notFound(res, "Ressource non trouvée");
      }

      if (req.user.role === "ADMIN" || req.user.role === "MANAGER") {
        return next();
      }

      if (ownerId !== req.user.userId) {
        return ResponseHandler.forbidden(
          res,
          "Vous ne pouvez accéder qu'à vos propres ressources"
        );
      }

      next();
    } catch (error) {
      logger.error("Ownership check failed", {
        error: error instanceof Error ? error.message : error,
        url: req.originalUrl,
      });

      return ResponseHandler.serverError(
        res,
        "Erreur de vérification d'autorisation"
      );
    }
  };
}
