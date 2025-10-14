// backend/src/middleware/softDelete.ts
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

/**
 * Middleware Prisma pour la suppression logique (soft delete)
 * ----------------------------------------------------------
 * Compatible Prisma v6.17+ (MiddlewareParams n’est plus exporté)
 */
export function applySoftDeleteMiddleware(prisma: PrismaClient) {
  // ✅ $use est bien une méthode de PrismaClient, pas besoin de typage explicite
  (prisma as any).$use(async (params: any, next: any) => {
    // 🟢 Interception des lectures uniques
    if (params.action === "findUnique" || params.action === "findFirst") {
      params.action = "findFirst";
      params.args = params.args || {};
      params.args.where = { ...params.args.where, isActive: true };
    }

    // 🟢 Interception des requêtes findMany
    if (params.action === "findMany") {
      params.args = params.args || {};
      if (!params.args.where) params.args.where = {};
      if (params.args.where.isActive === undefined) {
        params.args.where.isActive = true;
      }
    }

    // 🔴 Interception des suppressions
    if (params.action === "delete") {
      params.action = "update";
      params.args = params.args || {};
      params.args.data = { isActive: false };
      logger.info(`🗑️ Soft delete appliqué sur ${params.model}`);
    }

    if (params.action === "deleteMany") {
      params.action = "updateMany";
      params.args = params.args || {};
      if (!params.args.data) params.args.data = {};
      params.args.data.isActive = false;
      logger.info(`🗑️ Soft delete multiple appliqué sur ${params.model}`);
    }

    // ✅ Exécution de la requête finale
    return next(params);
  });
}
