// backend/src/services/VarietyService.ts - VERSION CORRIGÉE
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import { CropType } from "@prisma/client";
import DataTransformer from "../utils/transformers";

export class VarietyService {
  static async createVariety(data: any): Promise<any> {
    try {
      // Transformer le type de culture vers le format DB
      let cropType = data.cropType;

      // Mapping UI vers DB
      const cropTypeMapping: Record<string, CropType> = {
        rice: CropType.RICE,
        maize: CropType.MAIZE,
        peanut: CropType.PEANUT,
        sorghum: CropType.SORGHUM,
        cowpea: CropType.COWPEA,
        millet: CropType.MILLET,
        wheat: CropType.WHEAT,
        // Accepter aussi les majuscules
        RICE: CropType.RICE,
        MAIZE: CropType.MAIZE,
        PEANUT: CropType.PEANUT,
        SORGHUM: CropType.SORGHUM,
        COWPEA: CropType.COWPEA,
        MILLET: CropType.MILLET,
        WHEAT: CropType.WHEAT,
      };

      const dbCropType = cropTypeMapping[cropType];

      if (!dbCropType) {
        throw new Error(`Type de culture invalide: ${cropType}`);
      }

      const variety = await prisma.variety.create({
        data: {
          code: data.code.toUpperCase(), // Toujours en majuscules
          name: data.name,
          cropType: dbCropType,
          description: data.description,
          maturityDays: data.maturityDays,
          yieldPotential: data.yieldPotential,
          resistances: data.resistances || [],
          origin: data.origin,
          releaseYear: data.releaseYear,
        },
      });

      // Transformer pour le frontend
      return DataTransformer.transformVariety(variety);
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

      if (cropType) {
        // Transformer le cropType UI vers DB
        const cropTypeMapping: Record<string, CropType> = {
          rice: CropType.RICE,
          maize: CropType.MAIZE,
          peanut: CropType.PEANUT,
          sorghum: CropType.SORGHUM,
          cowpea: CropType.COWPEA,
          millet: CropType.MILLET,
          wheat: CropType.WHEAT,
        };

        where.cropType = cropTypeMapping[cropType] || cropType;
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

      // Transformer les variétés pour le frontend
      const transformedVarieties = varieties.map((variety) =>
        DataTransformer.transformVariety(variety)
      );

      return {
        varieties: transformedVarieties,
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
            code: id.toUpperCase(), // Chercher avec le code en majuscules
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

      if (!variety) {
        return null;
      }

      // Transformer la variété et ses relations
      const transformedVariety = DataTransformer.transformVariety(variety);

      if (transformedVariety.seedLots) {
        transformedVariety.seedLots = transformedVariety.seedLots.map(
          (lot: any) => DataTransformer.transformSeedLot(lot)
        );
      }

      return transformedVariety;
    } catch (error) {
      logger.error("Erreur lors de la récupération de la variété:", error);
      throw error;
    }
  }

  static async updateVariety(id: string, data: any): Promise<any> {
    try {
      // Transformer le cropType si fourni
      if (data.cropType) {
        const cropTypeMapping: Record<string, CropType> = {
          rice: CropType.RICE,
          maize: CropType.MAIZE,
          peanut: CropType.PEANUT,
          sorghum: CropType.SORGHUM,
          cowpea: CropType.COWPEA,
          millet: CropType.MILLET,
          wheat: CropType.WHEAT,
        };

        const dbCropType = cropTypeMapping[data.cropType] || data.cropType;

        if (!Object.values(CropType).includes(dbCropType)) {
          throw new Error(`Type de culture invalide: ${data.cropType}`);
        }

        data.cropType = dbCropType;
      }

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

      const variety = await prisma.variety.update({
        where,
        data: updateData,
      });

      return DataTransformer.transformVariety(variety);
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
