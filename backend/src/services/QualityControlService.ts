// ===== 4. backend/src/services/QualityControlService.ts - MISE À JOUR AVEC TRANSFORMATEURS =====
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { CreateQualityControlData } from "../types/entities";
import { PaginationQuery } from "../types/api";
import { TestResult, LotStatus } from "@prisma/client";
import { DataTransformer } from "../utils/transformers"; // ✅ AJOUTÉ

export class QualityControlService {
  static async createQualityControl(
    data: CreateQualityControlData & { inspectorId: number }
  ): Promise<any> {
    try {
      const seedLot = await prisma.seedLot.findUnique({
        where: { id: data.lotId, isActive: true },
      });

      if (!seedLot) {
        throw new Error("Lot de semences non trouvé");
      }

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
          result,
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

      if (result === TestResult.PASS) {
        await prisma.seedLot.update({
          where: { id: data.lotId },
          data: { status: LotStatus.CERTIFIED },
        });
      } else {
        await prisma.seedLot.update({
          where: { id: data.lotId },
          data: { status: LotStatus.REJECTED },
        });
      }

      // ✅ TRANSFORMATION : Transformer le contrôle qualité pour le frontend
      return DataTransformer.transformQualityControl(qualityControl);
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
      ? TestResult.PASS
      : TestResult.FAIL;
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

      const pageNum = parseInt(page.toString());
      const pageSizeNum = parseInt(pageSize.toString());
      const skip = (pageNum - 1) * pageSizeNum;

      const where: any = {};

      if (search) {
        where.OR = [
          { lotId: { contains: search, mode: "insensitive" } },
          { observations: { contains: search, mode: "insensitive" } },
        ];
      }

      if (result) {
        // ✅ TRANSFORMATION : Transformer le résultat UI vers DB
        where.result = DataTransformer.transformTestResultUIToDB(result);
      }

      if (lotId) {
        where.lotId = lotId;
      }

      if (inspectorId) {
        where.inspectorId = parseInt(inspectorId.toString());
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
          take: pageSizeNum,
        }),
        prisma.qualityControl.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSizeNum);

      // ✅ TRANSFORMATION : Transformer tous les contrôles pour le frontend
      const transformedControls = controls.map((control) =>
        DataTransformer.transformQualityControl(control)
      );

      return {
        controls: transformedControls,
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

      if (!qualityControl) {
        return null;
      }

      // ✅ TRANSFORMATION : Transformer le contrôle qualité pour le frontend
      return DataTransformer.transformQualityControl(qualityControl);
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

      // ✅ TRANSFORMATION : Transformer le contrôle qualité pour le frontend
      return DataTransformer.transformQualityControl(qualityControl);
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
