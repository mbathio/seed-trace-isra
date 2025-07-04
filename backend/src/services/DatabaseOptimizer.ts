import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

export class DatabaseOptimizer {
  private static prisma = new PrismaClient();

  // Analyse des requêtes lentes
  static async analyzeSlowQueries(): Promise<any[]> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          query,
          mean_exec_time,
          calls,
          total_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 20
      `;

      logger.info("Slow queries analysis completed");
      return result as any[];
    } catch (error) {
      logger.error("Error analyzing slow queries:", error);
      return [];
    }
  }

  // Optimisation des index
  static async suggestIndexes(): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      // Vérifier les colonnes fréquemment utilisées dans WHERE sans index
      const missingIndexes = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats
        WHERE schemaname = 'public'
          AND n_distinct > 100
          AND correlation < 0.1
          AND NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = pg_stats.tablename
              AND indexdef LIKE '%' || attname || '%'
          )
      `;

      for (const row of missingIndexes as any[]) {
        suggestions.push(
          `CREATE INDEX idx_${row.tablename}_${row.attname} ON ${row.tablename}(${row.attname});`
        );
      }

      return suggestions;
    } catch (error) {
      logger.error("Error suggesting indexes:", error);
      return [];
    }
  }

  // Nettoyage des données obsolètes
  static async cleanupObsoleteData(): Promise<void> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Supprimer les tokens expirés
      const deletedTokens = await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      // Archiver les vieux logs
      const archivedLogs = await this.prisma.$executeRaw`
        INSERT INTO archived_logs 
        SELECT * FROM logs 
        WHERE created_at < ${sixMonthsAgo}
      `;

      logger.info("Database cleanup completed", {
        deletedTokens: deletedTokens.count,
        archivedLogs,
      });
    } catch (error) {
      logger.error("Error during database cleanup:", error);
    }
  }
}
