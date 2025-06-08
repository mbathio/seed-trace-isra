// backend/src/services/ReportService.ts
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";

export class ReportService {
  static async getReports(
    query: PaginationQuery & any
  ): Promise<{ reports: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        type,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = query;

      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (type) {
        where.type = type;
      }

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSize,
        }),
        prisma.report.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        reports,
        total,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des rapports:", error);
      throw error;
    }
  }

  static async getReportById(id: number): Promise<any> {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return report;
    } catch (error) {
      logger.error("Erreur lors de la récupération du rapport:", error);
      throw error;
    }
  }

  static async createReport(data: any): Promise<any> {
    try {
      const report = await prisma.report.create({
        data: {
          title: data.title,
          type: data.type,
          description: data.description,
          createdById: data.createdById,
          parameters: data.parameters,
          data: data.data,
          isPublic: data.isPublic || false,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return report;
    } catch (error) {
      logger.error("Erreur lors de la création du rapport:", error);
      throw error;
    }
  }

  static async getProductionReport(filters: any): Promise<any> {
    try {
      const { startDate, endDate, multiplierId, varietyId } = filters;

      const where: any = {};

      if (startDate) {
        where.startDate = { gte: new Date(startDate) };
      }

      if (endDate) {
        where.startDate = { ...where.startDate, lte: new Date(endDate) };
      }

      if (multiplierId) {
        where.multiplierId = parseInt(multiplierId);
      }

      if (varietyId) {
        where.seedLot = { varietyId };
      }

      const productions = await prisma.production.findMany({
        where,
        include: {
          seedLot: {
            include: {
              variety: true,
            },
          },
          multiplier: true,
          parcel: true,
          activities: true,
          issues: true,
        },
        orderBy: { startDate: "desc" },
      });

      // Calculer les statistiques
      const stats = {
        totalProductions: productions.length,
        totalPlannedQuantity: productions.reduce(
          (sum, p) => sum + (p.plannedQuantity || 0),
          0
        ),
        totalActualYield: productions.reduce(
          (sum, p) => sum + (p.actualYield || 0),
          0
        ),
        completedProductions: productions.filter(
          (p) => p.status === "COMPLETED"
        ).length,
        inProgressProductions: productions.filter(
          (p) => p.status === "IN_PROGRESS"
        ).length,
        averageYield: 0,
      };

      const completedWithYield = productions.filter(
        (p) => p.status === "COMPLETED" && p.actualYield
      );

      if (completedWithYield.length > 0) {
        stats.averageYield =
          completedWithYield.reduce((sum, p) => sum + (p.actualYield || 0), 0) /
          completedWithYield.length;
      }

      return {
        productions,
        statistics: stats,
        summary: {
          totalProductions: stats.totalProductions,
          successRate:
            stats.totalProductions > 0
              ? (stats.completedProductions / stats.totalProductions) * 100
              : 0,
          averageYield: stats.averageYield,
        },
      };
    } catch (error) {
      logger.error(
        "Erreur lors de la génération du rapport de production:",
        error
      );
      throw error;
    }
  }

  static async getQualityReport(filters: any): Promise<any> {
    try {
      const { startDate, endDate, result, varietyId } = filters;

      const where: any = {};

      if (startDate) {
        where.controlDate = { gte: new Date(startDate) };
      }

      if (endDate) {
        where.controlDate = { ...where.controlDate, lte: new Date(endDate) };
      }

      if (result) {
        where.result = result;
      }

      if (varietyId) {
        where.seedLot = { varietyId };
      }

      const qualityControls = await prisma.qualityControl.findMany({
        where,
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
          inspector: {
            select: { id: true, name: true },
          },
        },
        orderBy: { controlDate: "desc" },
      });

      // Calculer les statistiques
      const stats = {
        totalControls: qualityControls.length,
        passedControls: qualityControls.filter((qc) => qc.result === "PASS")
          .length,
        failedControls: qualityControls.filter((qc) => qc.result === "FAIL")
          .length,
        averageGerminationRate: 0,
        averageVarietyPurity: 0,
        averageMoistureContent: 0,
        averageSeedHealth: 0,
      };

      if (qualityControls.length > 0) {
        stats.averageGerminationRate =
          qualityControls.reduce((sum, qc) => sum + qc.germinationRate, 0) /
          qualityControls.length;

        stats.averageVarietyPurity =
          qualityControls.reduce((sum, qc) => sum + qc.varietyPurity, 0) /
          qualityControls.length;

        const withMoisture = qualityControls.filter((qc) => qc.moistureContent);
        if (withMoisture.length > 0) {
          stats.averageMoistureContent =
            withMoisture.reduce(
              (sum, qc) => sum + (qc.moistureContent || 0),
              0
            ) / withMoisture.length;
        }

        const withHealth = qualityControls.filter((qc) => qc.seedHealth);
        if (withHealth.length > 0) {
          stats.averageSeedHealth =
            withHealth.reduce((sum, qc) => sum + (qc.seedHealth || 0), 0) /
            withHealth.length;
        }
      }

      return {
        qualityControls,
        statistics: stats,
        summary: {
          totalControls: stats.totalControls,
          passRate:
            stats.totalControls > 0
              ? (stats.passedControls / stats.totalControls) * 100
              : 0,
          averageGerminationRate: stats.averageGerminationRate,
          averageVarietyPurity: stats.averageVarietyPurity,
        },
      };
    } catch (error) {
      logger.error(
        "Erreur lors de la génération du rapport de qualité:",
        error
      );
      throw error;
    }
  }

  static async getInventoryReport(filters: any): Promise<any> {
    try {
      const { level, status, varietyId } = filters;

      const where: any = {
        isActive: true,
      };

      if (level) {
        where.level = level;
      }

      if (status) {
        where.status = status;
      }

      if (varietyId) {
        where.varietyId = varietyId;
      }

      const seedLots = await prisma.seedLot.findMany({
        where,
        include: {
          variety: true,
          multiplier: true,
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
        orderBy: { productionDate: "desc" },
      });

      // Calculer les statistiques par niveau
      const statsByLevel = seedLots.reduce((acc: any, lot) => {
        if (!acc[lot.level]) {
          acc[lot.level] = {
            count: 0,
            totalQuantity: 0,
            certified: 0,
            pending: 0,
            rejected: 0,
          };
        }

        acc[lot.level].count++;
        acc[lot.level].totalQuantity += lot.quantity;

        if (lot.status === "CERTIFIED") acc[lot.level].certified++;
        else if (lot.status === "PENDING") acc[lot.level].pending++;
        else if (lot.status === "REJECTED") acc[lot.level].rejected++;

        return acc;
      }, {});

      // Statistiques par variété
      const statsByVariety = seedLots.reduce((acc: any, lot) => {
        const varietyName = lot.variety.name;
        if (!acc[varietyName]) {
          acc[varietyName] = {
            count: 0,
            totalQuantity: 0,
            levels: new Set(),
          };
        }

        acc[varietyName].count++;
        acc[varietyName].totalQuantity += lot.quantity;
        acc[varietyName].levels.add(lot.level);

        return acc;
      }, {});

      // Convertir Sets en arrays pour la sérialisation JSON
      Object.keys(statsByVariety).forEach((variety) => {
        statsByVariety[variety].levels = Array.from(
          statsByVariety[variety].levels
        );
      });

      return {
        seedLots,
        statistics: {
          totalLots: seedLots.length,
          totalQuantity: seedLots.reduce((sum, lot) => sum + lot.quantity, 0),
          byLevel: statsByLevel,
          byVariety: statsByVariety,
          byStatus: {
            certified: seedLots.filter((lot) => lot.status === "CERTIFIED")
              .length,
            pending: seedLots.filter((lot) => lot.status === "PENDING").length,
            rejected: seedLots.filter((lot) => lot.status === "REJECTED")
              .length,
            in_stock: seedLots.filter((lot) => lot.status === "IN_STOCK")
              .length,
          },
        },
      };
    } catch (error) {
      logger.error(
        "Erreur lors de la génération du rapport d'inventaire:",
        error
      );
      throw error;
    }
  }

  static async getMultiplierPerformanceReport(filters: any): Promise<any> {
    try {
      const { startDate, endDate, multiplierId } = filters;

      const where: any = {
        isActive: true,
      };

      if (multiplierId) {
        where.id = parseInt(multiplierId);
      }

      const multipliers = await prisma.multiplier.findMany({
        where,
        include: {
          productions: {
            where: {
              ...(startDate && { startDate: { gte: new Date(startDate) } }),
              ...(endDate && { endDate: { lte: new Date(endDate) } }),
            },
            include: {
              seedLot: {
                include: {
                  variety: true,
                  qualityControls: {
                    orderBy: { controlDate: "desc" },
                    take: 1,
                  },
                },
              },
            },
          },
          contracts: {
            where: {
              ...(startDate && { startDate: { gte: new Date(startDate) } }),
              ...(endDate && { endDate: { lte: new Date(endDate) } }),
            },
          },
          seedLots: {
            where: {
              ...(startDate && {
                productionDate: { gte: new Date(startDate) },
              }),
              ...(endDate && { productionDate: { lte: new Date(endDate) } }),
            },
            include: {
              qualityControls: {
                orderBy: { controlDate: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      // Calculer les performances pour chaque multiplicateur
      const performanceData = multipliers.map((multiplier) => {
        const completedProductions = multiplier.productions.filter(
          (p) => p.status === "COMPLETED"
        );

        const qualityControls = multiplier.seedLots.flatMap(
          (lot) => lot.qualityControls
        );

        const passedControls = qualityControls.filter(
          (qc) => qc.result === "PASS"
        );

        return {
          multiplier: {
            id: multiplier.id,
            name: multiplier.name,
            certificationLevel: multiplier.certificationLevel,
            yearsExperience: multiplier.yearsExperience,
          },
          performance: {
            totalProductions: multiplier.productions.length,
            completedProductions: completedProductions.length,
            totalContracts: multiplier.contracts.length,
            activeContracts: multiplier.contracts.filter(
              (c) => c.status === "ACTIVE"
            ).length,
            totalSeedLots: multiplier.seedLots.length,
            qualityPassRate:
              qualityControls.length > 0
                ? (passedControls.length / qualityControls.length) * 100
                : 0,
            averageYield:
              completedProductions.length > 0
                ? completedProductions.reduce(
                    (sum, p) => sum + (p.actualYield || 0),
                    0
                  ) / completedProductions.length
                : 0,
            completionRate:
              multiplier.productions.length > 0
                ? (completedProductions.length /
                    multiplier.productions.length) *
                  100
                : 0,
          },
        };
      });

      // Trier par score de performance (combinaison de plusieurs métriques)
      performanceData.sort((a, b) => {
        const scoreA =
          (a.performance.qualityPassRate + a.performance.completionRate) / 2;
        const scoreB =
          (b.performance.qualityPassRate + b.performance.completionRate) / 2;
        return scoreB - scoreA;
      });

      return {
        multipliers: performanceData,
        summary: {
          totalMultipliers: multipliers.length,
          averageQualityPassRate:
            performanceData.length > 0
              ? performanceData.reduce(
                  (sum, m) => sum + m.performance.qualityPassRate,
                  0
                ) / performanceData.length
              : 0,
          averageCompletionRate:
            performanceData.length > 0
              ? performanceData.reduce(
                  (sum, m) => sum + m.performance.completionRate,
                  0
                ) / performanceData.length
              : 0,
          topPerformers: performanceData.slice(0, 5),
        },
      };
    } catch (error) {
      logger.error(
        "Erreur lors de la génération du rapport de performance:",
        error
      );
      throw error;
    }
  }
}
