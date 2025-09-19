// backend/src/services/QualityControlService.ts - VERSION UNIFIÉE CORRIGÉE
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { CreateQualityControlData } from "../types/entities";
import { PaginationQuery } from "../types/api";
import { TestResult, LotStatus } from "@prisma/client";

export class QualityControlService {
  /**
   * Créer un nouveau contrôle qualité
   */
  static async createQualityControl(
    data: CreateQualityControlData & { inspectorId: number }
  ): Promise<any> {
    try {
      // Vérifier que le lot existe et est actif
      const seedLot = await prisma.seedLot.findUnique({
        where: { id: data.lotId, isActive: true },
      });

      if (!seedLot) {
        throw new Error("Lot de semences non trouvé ou inactif");
      }

      // Déterminer automatiquement le résultat basé sur les seuils
      const result = this.determineResult(
        data.germinationRate,
        data.varietyPurity,
        seedLot.level
      );

      // Créer le contrôle qualité
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
          laboratoryRef: data.laboratoryRef,
          inspectorId: data.inspectorId,
        },
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
              parcel: true,
            },
          },
          inspector: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Mettre à jour le statut du lot selon le résultat
      if (result === TestResult.pass) {
        await prisma.seedLot.update({
          where: { id: data.lotId },
          data: { status: LotStatus.certified },
        });

        // Générer automatiquement un certificat si nécessaire
        const certificateUrl = await this.generateCertificate(
          qualityControl.id
        );
        const updatedQualityControl = await prisma.qualityControl.update({
          where: { id: qualityControl.id },
          data: { certificateUrl },
        });
        qualityControl.certificateUrl = certificateUrl;
      } else {
        await prisma.seedLot.update({
          where: { id: data.lotId },
          data: { status: LotStatus.rejected },
        });
      }

      logger.info(`Contrôle qualité créé avec succès`, {
        qualityControlId: qualityControl.id,
        lotId: data.lotId,
        result,
      });

      return qualityControl; // Retour direct
    } catch (error) {
      logger.error("Erreur lors de la création du contrôle qualité:", error);
      throw error;
    }
  }

  /**
   * Déterminer le résultat basé sur les seuils par niveau
   */
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
      ? TestResult.pass
      : TestResult.fail;
  }

  /**
   * ✅ RETOURNE: { data, total, meta } - Structure unifiée
   */
  static async getQualityControls(
    query: PaginationQuery & any
  ): Promise<{ data: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        result,
        lotId,
        inspectorId,
        varietyId,
        multiplierId,
        startDate,
        endDate,
        minGerminationRate,
        maxGerminationRate,
        sortBy = "controlDate",
        sortOrder = "desc",
      } = query;

      const pageNum = parseInt(page.toString());
      const pageSizeNum = parseInt(pageSize.toString());
      const skip = (pageNum - 1) * pageSizeNum;

      // Construction des conditions de recherche
      const where: any = {};

      if (search) {
        where.OR = [
          { lotId: { contains: search, mode: "insensitive" } },
          { observations: { contains: search, mode: "insensitive" } },
          { testMethod: { contains: search, mode: "insensitive" } },
          { laboratoryRef: { contains: search, mode: "insensitive" } },
        ];
      }

      if (result) {
        where.result = result; // Valeur Prisma directe
      }

      if (lotId) where.lotId = lotId;
      if (inspectorId) where.inspectorId = parseInt(inspectorId.toString());
      if (varietyId) where.seedLot = { varietyId: varietyId.toString() };
      if (multiplierId)
        where.seedLot = { multiplierId: parseInt(multiplierId.toString()) };

      // Filtres de date
      if (startDate || endDate) {
        where.controlDate = {};
        if (startDate) where.controlDate.gte = new Date(startDate);
        if (endDate) where.controlDate.lte = new Date(endDate);
      }

      // Filtres de taux
      if (minGerminationRate || maxGerminationRate) {
        where.germinationRate = {};
        if (minGerminationRate)
          where.germinationRate.gte = parseFloat(minGerminationRate.toString());
        if (maxGerminationRate)
          where.germinationRate.lte = parseFloat(maxGerminationRate.toString());
      }

      const [qualityControls, total] = await Promise.all([
        prisma.qualityControl.findMany({
          where,
          skip,
          take: pageSizeNum,
          orderBy: { [sortBy]: sortOrder },
          include: {
            seedLot: {
              include: {
                variety: true,
                multiplier: true,
              },
            },
            inspector: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        }),
        prisma.qualityControl.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSizeNum);

      logger.info(`Contrôles qualité récupérés`, {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
      });

      // ✅ RETOUR UNIFIÉ: 'data' au lieu de 'controls'
      return {
        data: qualityControls,
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

  /**
   * Récupérer un contrôle qualité par ID
   */
  static async getQualityControlById(id: number): Promise<any> {
    try {
      const qualityControl = await prisma.qualityControl.findUnique({
        where: { id },
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: {
                include: {
                  contracts: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                },
              },
              parcel: {
                include: {
                  soilAnalyses: {
                    orderBy: { analysisDate: "desc" },
                    take: 1,
                  },
                },
              },
              parentLot: true,
              childLots: {
                include: {
                  variety: true,
                },
              },
            },
          },
          inspector: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (!qualityControl) {
        return null;
      }

      // Ajouter des statistiques supplémentaires
      const stats = await this.getQualityControlStats(qualityControl.lotId);

      return {
        ...qualityControl,
        statistics: stats,
      }; // Retour direct avec stats
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération du contrôle qualité:",
        error
      );
      throw error;
    }
  }

  /**
   * Mettre à jour un contrôle qualité
   */
  static async updateQualityControl(id: number, data: any): Promise<any> {
    try {
      const existingControl = await prisma.qualityControl.findUnique({
        where: { id },
        include: { seedLot: true },
      });

      if (!existingControl) {
        throw new Error("Contrôle qualité non trouvé");
      }

      // Si on met à jour les taux, recalculer le résultat
      let updateData = { ...data };

      if (
        data.germinationRate !== undefined ||
        data.varietyPurity !== undefined
      ) {
        const newResult = this.determineResult(
          data.germinationRate ?? existingControl.germinationRate,
          data.varietyPurity ?? existingControl.varietyPurity,
          existingControl.seedLot.level
        );
        updateData.result = newResult;

        // Mettre à jour le statut du lot si le résultat change
        if (newResult !== existingControl.result) {
          if (newResult === TestResult.pass) {
            await prisma.seedLot.update({
              where: { id: existingControl.lotId },
              data: { status: LotStatus.certified },
            });
          } else {
            await prisma.seedLot.update({
              where: { id: existingControl.lotId },
              data: { status: LotStatus.rejected },
            });
          }
        }
      }

      const qualityControl = await prisma.qualityControl.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
              parcel: true,
            },
          },
          inspector: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      logger.info(`Contrôle qualité mis à jour`, {
        qualityControlId: id,
        changes: Object.keys(data),
      });

      return qualityControl; // Retour direct
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du contrôle qualité:", error);
      throw error;
    }
  }

  /**
   * Supprimer un contrôle qualité
   */
  static async deleteQualityControl(id: number): Promise<void> {
    try {
      const control = await prisma.qualityControl.findUnique({
        where: { id },
      });

      if (!control) {
        throw new Error("Contrôle qualité non trouvé");
      }

      await prisma.qualityControl.delete({
        where: { id },
      });

      // Optionnel: remettre le lot en statut PENDING si c'était le seul contrôle
      const remainingControls = await prisma.qualityControl.count({
        where: { lotId: control.lotId },
      });

      if (remainingControls === 0) {
        await prisma.seedLot.update({
          where: { id: control.lotId },
          data: { status: LotStatus.pending },
        });
      }

      logger.info(`Contrôle qualité supprimé`, { qualityControlId: id });
    } catch (error) {
      logger.error("Erreur lors de la suppression du contrôle qualité:", error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques d'un lot
   */
  private static async getQualityControlStats(lotId: string): Promise<any> {
    const allControls = await prisma.qualityControl.findMany({
      where: { lotId },
      orderBy: { controlDate: "desc" },
    });

    if (allControls.length === 0) {
      return null;
    }

    const passedControls = allControls.filter(
      (c) => c.result === TestResult.pass
    );
    const failedControls = allControls.filter(
      (c) => c.result === TestResult.fail
    );

    return {
      totalControls: allControls.length,
      passedControls: passedControls.length,
      failedControls: failedControls.length,
      passRate: (passedControls.length / allControls.length) * 100,
      averageGerminationRate:
        allControls.reduce((sum, c) => sum + c.germinationRate, 0) /
        allControls.length,
      averageVarietyPurity:
        allControls.reduce((sum, c) => sum + c.varietyPurity, 0) /
        allControls.length,
      lastControlDate: allControls[0].controlDate,
    };
  }

  /**
   * Générer un certificat pour un contrôle qualité
   */
  private static async generateCertificate(
    qualityControlId: number
  ): Promise<string> {
    // TODO: Implémenter la génération réelle du certificat PDF
    const baseUrl = process.env.API_URL || "http://localhost:3001";
    return `${baseUrl}/api/certificates/quality-control/${qualityControlId}`;
  }

  /**
   * Générer un rapport de contrôle qualité
   */
  static async generateQualityReport(
    filters: any
  ): Promise<{ data: any[]; summary: any }> {
    try {
      const controls = await prisma.qualityControl.findMany({
        where: filters,
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
          inspector: true,
        },
        orderBy: { controlDate: "desc" },
      });

      const summary = {
        totalControls: controls.length,
        passedControls: controls.filter((c) => c.result === TestResult.pass)
          .length,
        failedControls: controls.filter((c) => c.result === TestResult.fail)
          .length,
        averageGerminationRate:
          controls.reduce((sum, c) => sum + c.germinationRate, 0) /
            controls.length || 0,
        averageVarietyPurity:
          controls.reduce((sum, c) => sum + c.varietyPurity, 0) /
            controls.length || 0,
        byVariety: this.groupByVariety(controls),
        byMultiplier: this.groupByMultiplier(controls),
        byMonth: this.groupByMonth(controls),
      };

      return { data: controls, summary };
    } catch (error) {
      logger.error("Erreur lors de la génération du rapport:", error);
      throw error;
    }
  }

  // Méthodes de regroupement (inchangées)
  private static groupByVariety(controls: any[]): any {
    const groups: Record<string, any> = {};

    controls.forEach((control) => {
      const varietyId = control.seedLot.varietyId;
      const varietyName = control.seedLot.variety.name;

      if (!groups[varietyId]) {
        groups[varietyId] = {
          varietyId,
          varietyName,
          totalControls: 0,
          passedControls: 0,
          failedControls: 0,
          averageGerminationRate: 0,
          averageVarietyPurity: 0,
        };
      }

      groups[varietyId].totalControls++;
      if (control.result === TestResult.pass) {
        groups[varietyId].passedControls++;
      } else {
        groups[varietyId].failedControls++;
      }

      groups[varietyId].averageGerminationRate += control.germinationRate;
      groups[varietyId].averageVarietyPurity += control.varietyPurity;
    });

    Object.values(groups).forEach((group) => {
      group.averageGerminationRate /= group.totalControls;
      group.averageVarietyPurity /= group.totalControls;
      group.passRate = (group.passedControls / group.totalControls) * 100;
    });

    return Object.values(groups);
  }

  private static groupByMultiplier(controls: any[]): any {
    const groups: Record<string, any> = {};

    controls.forEach((control) => {
      if (!control.seedLot.multiplier) return;

      const multiplierId = control.seedLot.multiplierId;
      const multiplierName = control.seedLot.multiplier.name;

      if (!groups[multiplierId]) {
        groups[multiplierId] = {
          multiplierId,
          multiplierName,
          totalControls: 0,
          passedControls: 0,
          failedControls: 0,
          averageGerminationRate: 0,
          averageVarietyPurity: 0,
        };
      }

      groups[multiplierId].totalControls++;
      if (control.result === TestResult.pass) {
        groups[multiplierId].passedControls++;
      } else {
        groups[multiplierId].failedControls++;
      }

      groups[multiplierId].averageGerminationRate += control.germinationRate;
      groups[multiplierId].averageVarietyPurity += control.varietyPurity;
    });

    Object.values(groups).forEach((group) => {
      group.averageGerminationRate /= group.totalControls;
      group.averageVarietyPurity /= group.totalControls;
      group.passRate = (group.passedControls / group.totalControls) * 100;
    });

    return Object.values(groups);
  }

  private static groupByMonth(controls: any[]): any {
    const groups: Record<string, any> = {};

    controls.forEach((control) => {
      const date = new Date(control.controlDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!groups[monthKey]) {
        groups[monthKey] = {
          month: monthKey,
          totalControls: 0,
          passedControls: 0,
          failedControls: 0,
        };
      }

      groups[monthKey].totalControls++;
      if (control.result === TestResult.pass) {
        groups[monthKey].passedControls++;
      } else {
        groups[monthKey].failedControls++;
      }
    });

    Object.values(groups).forEach((group) => {
      group.passRate = (group.passedControls / group.totalControls) * 100;
    });

    return Object.values(groups).sort((a, b) => a.month.localeCompare(b.month));
  }
}
