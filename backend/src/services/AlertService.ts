// ===== 1. backend/src/services/AlertService.ts =====
import { prisma } from "../config/database";
import { NotificationService } from "./NotificationService";
import { logger } from "../utils/logger";

export class AlertService {
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
        // Récupérer les emails des managers et admins
        const recipients = await prisma.user.findMany({
          where: {
            isActive: true,
            role: { in: ["manager", "admin"] }, // ✅ CORRIGÉ: minuscules
          },
          select: { email: true },
        });

        const emailList = recipients.map((user) => user.email);

        await NotificationService.notifyLotExpiring(expiringLots, emailList);

        logger.info(
          `Alerte envoyée pour ${expiringLots.length} lots expirant bientôt`
        );
      }
    } catch (error) {
      logger.error("Erreur lors de la vérification des lots expirants:", error);
    }
  }

  static async checkFailedQualityControls(): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const failedControls = await prisma.qualityControl.findMany({
        where: {
          result: "fail", // ✅ CORRIGÉ: minuscules
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
        const recipients = await prisma.user.findMany({
          where: {
            isActive: true,
            role: { in: ["manager", "admin", "inspector"] }, // ✅ CORRIGÉ: minuscules
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
          `${failedControls.length} contrôles qualité ont échoué hier`
        );
      }
    } catch (error) {
      logger.error(
        "Erreur lors de la vérification des contrôles qualité:",
        error
      );
    }
  }

  static async runAllChecks(): Promise<void> {
    logger.info("🔍 Début des vérifications automatiques...");

    await Promise.all([
      this.checkExpiringLots(),
      this.checkFailedQualityControls(),
    ]);

    logger.info("✅ Vérifications automatiques terminées");
  }
}
