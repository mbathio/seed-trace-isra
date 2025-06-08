import { prisma } from "../config/database";
import { logger } from "../utils/logger";

export class StatisticsService {
  static async getDashboardStats(): Promise<any> {
    try {
      const [
        totalSeedLots,
        activeSeedLots,
        totalProductions,
        completedProductions,
        totalQualityControls,
        passedQualityControls,
        activeMultipliers,
        totalVarieties,
      ] = await Promise.all([
        prisma.seedLot.count({ where: { isActive: true } }),
        prisma.seedLot.count({ where: { isActive: true, status: "ACTIVE" } }),
        prisma.production.count(),
        prisma.production.count({ where: { status: "COMPLETED" } }),
        prisma.qualityControl.count(),
        prisma.qualityControl.count({ where: { result: "PASS" } }),
        prisma.multiplier.count({
          where: { isActive: true, status: "ACTIVE" },
        }),
        prisma.variety.count({ where: { isActive: true } }),
      ]);

      // Statistiques par niveau de semence
      const lotsByLevel = await prisma.seedLot.groupBy({
        by: ["level"],
        where: { isActive: true },
        _count: { id: true },
        _sum: { quantity: true },
      });

      // Statistiques par variété (top 5)
      const topVarieties = await prisma.seedLot.groupBy({
        by: ["varietyId"],
        where: { isActive: true },
        _count: { id: true },
        _sum: { quantity: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      });

      // Enrichir avec les noms des variétés
      const varietiesWithNames = await Promise.all(
        topVarieties.map(async (item) => {
          const variety = await prisma.variety.findUnique({
            where: { id: item.varietyId },
            select: { name: true, code: true },
          });
          return {
            ...item,
            variety,
          };
        })
      );

      // Productions récentes (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentProductions = await prisma.production.count({
        where: {
          startDate: { gte: thirtyDaysAgo },
        },
      });

      return {
        overview: {
          totalSeedLots,
          activeSeedLots,
          totalProductions,
          completedProductions,
          totalQualityControls,
          passedQualityControls,
          activeMultipliers,
          totalVarieties,
        },
        rates: {
          productionCompletionRate:
            totalProductions > 0
              ? (completedProductions / totalProductions) * 100
              : 0,
          qualityPassRate:
            totalQualityControls > 0
              ? (passedQualityControls / totalQualityControls) * 100
              : 0,
        },
        distribution: {
          lotsByLevel: lotsByLevel.map((item) => ({
            level: item.level,
            count: item._count.id,
            totalQuantity: item._sum.quantity || 0,
          })),
          topVarieties: varietiesWithNames.map((item) => ({
            variety: item.variety,
            count: item._count.id,
            totalQuantity: item._sum.quantity || 0,
          })),
        },
        activity: {
          recentProductions,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  static async getMonthlyTrends(months: number = 12): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Tendances des productions
      const productionTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "startDate") as month,
          COUNT(*)::int as count,
          AVG("actualYield")::float as avgYield
        FROM "productions"
        WHERE "startDate" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "startDate")
        ORDER BY month ASC
      `;

      // Tendances des contrôles qualité
      const qualityTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "controlDate") as month,
          COUNT(*)::int as total,
          COUNT(CASE WHEN result = 'PASS' THEN 1 END)::int as passed
        FROM "quality_controls"
        WHERE "controlDate" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "controlDate")
        ORDER BY month ASC
      `;

      return {
        production: productionTrends,
        quality: qualityTrends,
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des tendances:", error);
      throw error;
    }
  }
}
