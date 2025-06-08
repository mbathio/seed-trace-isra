// backend/src/services/QualityControlService.ts
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { CreateQualityControlData } from "../types/entities";
import { PaginationQuery } from "../types/api";
import { TestResult, LotStatus } from "@prisma/client"; // ✅ Import des enums

export class QualityControlService {
  static async createQualityControl(
    data: CreateQualityControlData & { inspectorId: number }
  ): Promise<any> {
    try {
      // Vérifier que le lot existe
      const seedLot = await prisma.seedLot.findUnique({
        where: { id: data.lotId, isActive: true },
      });

      if (!seedLot) {
        throw new Error("Lot de semences non trouvé");
      }

      // Déterminer le résultat automatiquement basé sur les seuils
      const result = this.determineResult(
        data.germinationRate,
        data.varietyPurity,
        seedLot.level
      );

      const qualityControl = await prisma.qualityControl.create({
        data: {
          lotId: data.lotId,
          controlDate: new Date(data.controlDate),
          germinationRate: data.germinationRate,
          varietyPurity: data.varietyPurity,
          moistureContent: data.moistureContent,
          seedHealth: data.seedHealth,
          result, // ✅ Utilise directement la valeur de l'énumération
          observations: data.observations,
          testMethod: data.testMethod,
          inspectorId: data.inspectorId,
        },
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
          inspector: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Mettre à jour le statut du lot si le test passe
      if (result === TestResult.PASS) {
        // ✅ Utilisation de l'enum
        await prisma.seedLot.update({
          where: { id: data.lotId },
          data: { status: LotStatus.CERTIFIED }, // ✅ Utilisation de l'enum
        });
      } else {
        await prisma.seedLot.update({
          where: { id: data.lotId },
          data: { status: LotStatus.REJECTED }, // ✅ Utilisation de l'enum
        });
      }

      return qualityControl;
    } catch (error) {
      logger.error("Erreur lors de la création du contrôle qualité:", error);
      throw error;
    }
  }

  private static determineResult(
    germinationRate: number,
    varietyPurity: number,
    level: string
  ): TestResult {
    // ✅ Type de retour avec l'enum
    // Seuils minimaux selon le niveau de semence
    const thresholds: {
      [key: string]: { germination: number; purity: number };
    } = {
      GO: { germination: 98, purity: 99.9 },
      G1: { germination: 95, purity: 99.5 },
      G2: { germination: 90, purity: 99.0 },
      G3: { germination: 85, purity: 98.0 },
      G4: { germination: 80, purity: 97.0 },
      R1: { germination: 80, purity: 97.0 },
      R2: { germination: 80, purity: 95.0 },
    };

    const threshold = thresholds[level] || thresholds["R2"];

    return germinationRate >= threshold.germination &&
      varietyPurity >= threshold.purity
      ? TestResult.PASS // ✅ Utilisation de l'enum
      : TestResult.FAIL; // ✅ Utilisation de l'enum
  }

  static async getQualityControls(
    query: PaginationQuery & any
  ): Promise<{ controls: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        result,
        lotId,
        inspectorId,
        sortBy = "controlDate",
        sortOrder = "desc",
      } = query;

      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (search) {
        where.OR = [
          { lotId: { contains: search, mode: "insensitive" } },
          { observations: { contains: search, mode: "insensitive" } },
        ];
      }

      if (result) {
        where.result = result;
      }

      if (lotId) {
        where.lotId = lotId;
      }

      if (inspectorId) {
        where.inspectorId = parseInt(inspectorId);
      }

      const [controls, total] = await Promise.all([
        prisma.qualityControl.findMany({
          where,
          include: {
            seedLot: {
              include: {
                variety: true,
                multiplier: true,
              },
            },
            inspector: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSize,
        }),
        prisma.qualityControl.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        controls,
        total,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des contrôles qualité:",
        error
      );
      throw error;
    }
  }

  static async getQualityControlById(id: number): Promise<any> {
    try {
      const qualityControl = await prisma.qualityControl.findUnique({
        where: { id },
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
              parcel: true,
            },
          },
          inspector: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return qualityControl;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération du contrôle qualité:",
        error
      );
      throw error;
    }
  }

  static async updateQualityControl(id: number, data: any): Promise<any> {
    try {
      // Si on met à jour le résultat, recalculer automatiquement
      if (
        data.germinationRate !== undefined ||
        data.varietyPurity !== undefined
      ) {
        const existingControl = await prisma.qualityControl.findUnique({
          where: { id },
          include: { seedLot: true },
        });

        if (existingControl) {
          const newResult = this.determineResult(
            data.germinationRate ?? existingControl.germinationRate,
            data.varietyPurity ?? existingControl.varietyPurity,
            existingControl.seedLot.level
          );
          data.result = newResult;

          // Mettre à jour le statut du lot
          if (newResult === TestResult.PASS) {
            await prisma.seedLot.update({
              where: { id: existingControl.lotId },
              data: { status: LotStatus.CERTIFIED },
            });
          } else {
            await prisma.seedLot.update({
              where: { id: existingControl.lotId },
              data: { status: LotStatus.REJECTED },
            });
          }
        }
      }

      const qualityControl = await prisma.qualityControl.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
          inspector: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return qualityControl;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du contrôle qualité:", error);
      throw error;
    }
  }

  static async deleteQualityControl(id: number): Promise<void> {
    try {
      await prisma.qualityControl.delete({
        where: { id },
      });
    } catch (error) {
      logger.error("Erreur lors de la suppression du contrôle qualité:", error);
      throw error;
    }
  }
}
