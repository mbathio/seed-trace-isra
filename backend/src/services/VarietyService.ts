// backend/src/services/VarietyService.ts
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import { CropType } from "@prisma/client"; // ✅ Import de l'enum

export class VarietyService {
  static async createVariety(data: any): Promise<any> {
    try {
      // ✅ Validation du type de culture
      if (!Object.values(CropType).includes(data.cropType)) {
        throw new Error(`Type de culture invalide: ${data.cropType}`);
      }

      const variety = await prisma.variety.create({
        data: {
          code: data.code,
          name: data.name,
          cropType: data.cropType as CropType, // ✅ Cast vers l'enum
          description: data.description,
          maturityDays: data.maturityDays,
          yieldPotential: data.yieldPotential,
          resistances: data.resistances || [],
          origin: data.origin,
          releaseYear: data.releaseYear,
        },
      });

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

      // ✅ CORRECTION: Conversion explicite en entiers
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

      if (cropType) {
        where.cropType = cropType;
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
          take: pageSizeNum, // ✅ CORRECTION: Entier au lieu de string
        }),
        prisma.variety.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSizeNum);

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
      // ✅ Recherche flexible par ID numérique ou code
      let variety;

      // Essayer d'abord de parser comme nombre
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        // Recherche par ID numérique
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

      // Si non trouvé par ID ou si ce n'est pas un nombre, chercher par code
      if (!variety) {
        variety = await prisma.variety.findFirst({
          where: { code: id, isActive: true },
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

      return variety;
    } catch (error) {
      logger.error("Erreur lors de la récupération de la variété:", error);
      throw error;
    }
  }

  static async updateVariety(id: string, data: any): Promise<any> {
    try {
      // ✅ Validation du type de culture si fourni
      if (data.cropType && !Object.values(CropType).includes(data.cropType)) {
        throw new Error(`Type de culture invalide: ${data.cropType}`);
      }

      // ✅ Déterminer si c'est un ID ou un code
      const parsedId = parseInt(id);
      const where = !isNaN(parsedId) ? { id: parsedId } : { code: id };

      const updateData: any = {
        ...data,
        updatedAt: new Date(),
      };

      // Le code ne peut pas être modifié
      delete updateData.code;

      const variety = await prisma.variety.update({
        where,
        data: updateData,
      });

      return variety;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la variété:", error);
      throw error;
    }
  }

  static async deleteVariety(id: string): Promise<void> {
    try {
      // ✅ Déterminer si c'est un ID ou un code
      const parsedId = parseInt(id);
      const where = !isNaN(parsedId) ? { id: parsedId } : { code: id };

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
