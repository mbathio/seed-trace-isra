// backend/src/services/VarietyService.ts - VERSION UNIFIÉE
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import { CropType } from "@prisma/client";

export class VarietyService {
  static async createVariety(data: any): Promise<any> {
    try {
      // ✅ PLUS DE TRANSFORMATION - utilise directement les valeurs reçues
      const variety = await prisma.variety.create({
        data: {
          code: data.code.toUpperCase(), // Toujours en majuscules
          name: data.name,
          cropType: data.cropType, // Valeur Prisma directe
          description: data.description,
          maturityDays: data.maturityDays,
          yieldPotential: data.yieldPotential,
          resistances: data.resistances || [],
          origin: data.origin,
          releaseYear: data.releaseYear,
        },
      });

      // ✅ RETOUR DIRECT - plus de transformation
      return variety;
    } catch (error) {
      logger.error("Erreur lors de la création de la variété:", error);
      throw error;
    }
  }

  static async getVarieties(
    query: PaginationQuery & any
  ): Promise<{ varieties: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        cropType,
        sortBy = "name",
        sortOrder = "asc",
      } = query;

      const pageNum = parseInt(page.toString());
      const pageSizeNum = parseInt(pageSize.toString());
      const skip = (pageNum - 1) * pageSizeNum;

      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { origin: { contains: search, mode: "insensitive" } },
        ];
      }

      // ✅ UTILISATION DIRECTE - plus de mapping
      if (cropType) {
        where.cropType = cropType; // Valeur Prisma directe
      }

      const [varieties, total] = await Promise.all([
        prisma.variety.findMany({
          where,
          include: {
            _count: {
              select: {
                seedLots: {
                  where: { isActive: true },
                },
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSizeNum,
        }),
        prisma.variety.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSizeNum);

      // ✅ RETOUR DIRECT - plus de transformation
      return {
        varieties,
        total,
        meta: {
          page: pageNum,
          pageSize: pageSizeNum,
          totalCount: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des variétés:", error);
      throw error;
    }
  }

  static async getVarietyById(id: string): Promise<any> {
    try {
      let variety;

      // Essayer d'abord de parser comme nombre
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        variety = await prisma.variety.findUnique({
          where: { id: parsedId, isActive: true },
          include: {
            seedLots: {
              where: { isActive: true },
              include: {
                multiplier: true,
                parcel: true,
              },
              orderBy: { productionDate: "desc" },
              take: 10,
            },
            _count: {
              select: {
                seedLots: {
                  where: { isActive: true },
                },
                contracts: true,
              },
            },
          },
        });
      }

      // Si non trouvé par ID, chercher par code
      if (!variety) {
        variety = await prisma.variety.findFirst({
          where: {
            code: id.toUpperCase(),
            isActive: true,
          },
          include: {
            seedLots: {
              where: { isActive: true },
              include: {
                multiplier: true,
                parcel: true,
              },
              orderBy: { productionDate: "desc" },
              take: 10,
            },
            _count: {
              select: {
                seedLots: {
                  where: { isActive: true },
                },
                contracts: true,
              },
            },
          },
        });
      }

      // ✅ RETOUR DIRECT - plus de transformation
      return variety;
    } catch (error) {
      logger.error("Erreur lors de la récupération de la variété:", error);
      throw error;
    }
  }

  static async updateVariety(id: string, data: any): Promise<any> {
    try {
      // Déterminer si c'est un ID ou un code
      const parsedId = parseInt(id);
      const where = !isNaN(parsedId)
        ? { id: parsedId }
        : { code: id.toUpperCase() };

      const updateData: any = {
        ...data,
        updatedAt: new Date(),
      };

      // Le code ne peut pas être modifié
      delete updateData.code;

      // ✅ VALIDATION DIRECTE - plus de mapping cropType
      if (
        updateData.cropType &&
        !Object.values(CropType).includes(updateData.cropType)
      ) {
        throw new Error(`Type de culture invalide: ${updateData.cropType}`);
      }

      const variety = await prisma.variety.update({
        where,
        data: updateData,
      });

      // ✅ RETOUR DIRECT
      return variety;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la variété:", error);
      throw error;
    }
  }

  static async deleteVariety(id: string): Promise<void> {
    try {
      const parsedId = parseInt(id);
      const where = !isNaN(parsedId)
        ? { id: parsedId }
        : { code: id.toUpperCase() };

      await prisma.variety.update({
        where,
        data: { isActive: false },
      });
    } catch (error) {
      logger.error("Erreur lors de la suppression de la variété:", error);
      throw error;
    }
  }
}
