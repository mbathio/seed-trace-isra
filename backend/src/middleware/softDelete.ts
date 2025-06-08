import { PrismaClient } from "@prisma/client";

export function applySoftDeleteMiddleware(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    // Modifier les opérations de lecture pour exclure les éléments supprimés
    if (params.action === "findUnique" || params.action === "findFirst") {
      params.action = "findFirst";
      params.args.where = { ...params.args.where, isActive: true };
    }

    if (params.action === "findMany") {
      if (!params.args.where) params.args.where = {};
      if (params.args.where.isActive === undefined) {
        params.args.where.isActive = true;
      }
    }

    // Convertir les suppressions en soft delete
    if (params.action === "delete") {
      params.action = "update";
      params.args.data = { isActive: false };
    }

    if (params.action === "deleteMany") {
      params.action = "updateMany";
      if (!params.args.data) params.args.data = {};
      params.args.data.isActive = false;
    }

    return next(params);
  });
}
