// backend/src/services/AlertService.ts
import { prisma } from "../config/database";
import { NotificationService } from "./NotificationService";
import { logger } from "../utils/logger";

// ✅ Import des enums Prisma pour éviter les valeurs "MAGIC STRING"
import { Role, TestResult } from "@prisma/client";

export class AlertService {
  /**
   * Vérifie les lots qui expirent dans les 30 jours
   */
  static async checkExpiringLots(): Promise<void> {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringLots = await prisma.seedLot.findMany({
        where: {
          isActive: true,
          expiryDate: {
            lte: thirtyDaysFromNow,
            gte: new Date(), // Pas encore expirés
          },
        },
        include: {
          variety: true,
          multiplier: true,
        },
      });

      if (expiringLots.length > 0) {
        // ✅ Récupérer les emails des managers et admins via enums
        const recipients = await prisma.user.findMany({
          where: {
            isActive: true,
            role: {
              in: [Role.manager, Role.admin],
            },
          },
          select: { email: true },
        });

        const emailList = recipients.map((user) => user.email);

        await NotificationService.notifyLotExpiring(expiringLots, emailList);

        logger.info(
          `📢 Alerte envoyée pour ${expiringLots.length} lots expirant bientôt`
        );
      }
    } catch (error) {
      logger.error(
        "❌ Erreur lors de la vérification des lots expirants:",
        error
      );
    }
  }

  /**
   * Vérifie les contrôles qualité échoués (FAIL) dans les dernières 24h
   */
  static async checkFailedQualityControls(): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const failedControls = await prisma.qualityControl.findMany({
        where: {
          result: TestResult.fail, // ✅ Enum unifié
          controlDate: { gte: yesterday },
        },
        include: {
          seedLot: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
          inspector: true,
        },
      });

      for (const control of failedControls) {
        // ✅ Notifier managers, admins et inspecteurs
        const recipients = await prisma.user.findMany({
          where: {
            isActive: true,
            role: {
              in: [Role.manager, Role.admin, Role.inspector],
            },
          },
          select: { email: true },
        });

        const emailList = recipients.map((user) => user.email);

        await NotificationService.notifyQualityTestFailed(
          control.seedLot,
          control,
          emailList
        );
      }

      if (failedControls.length > 0) {
        logger.warn(
          `⚠️ ${failedControls.length} contrôles qualité ont échoué hier`
        );
      }
    } catch (error) {
      logger.error(
        "❌ Erreur lors de la vérification des contrôles qualité:",
        error
      );
    }
  }

  /**
   * Exécute toutes les vérifications
   */
  static async runAllChecks(): Promise<void> {
    logger.info("🔍 Début des vérifications automatiques...");

    await Promise.all([
      this.checkExpiringLots(),
      this.checkFailedQualityControls(),
    ]);

    logger.info("✅ Vérifications automatiques terminées");
  }
}
