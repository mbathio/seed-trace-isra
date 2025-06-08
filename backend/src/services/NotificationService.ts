import { logger } from "../utils/logger";

interface NotificationConfig {
  email?: {
    enabled: boolean;
    smtp: {
      host: string;
      port: number;
      user: string;
      pass: string;
    };
  };
  webhook?: {
    enabled: boolean;
    url: string;
  };
}

export class NotificationService {
  private static config: NotificationConfig = {
    email: { enabled: false, smtp: {} as any },
    webhook: { enabled: false, url: "" },
  };

  static async notifyQualityTestFailed(
    lot: any,
    qualityControl: any,
    recipients: string[]
  ): Promise<void> {
    const message = `
      ⚠️ ÉCHEC DU CONTRÔLE QUALITÉ
      
      Lot : ${lot.id}
      Variété : ${lot.variety.name}
      Taux de germination : ${qualityControl.germinationRate}%
      Pureté variétale : ${qualityControl.varietyPurity}%
      
      Action requise : Vérifier le lot et prendre les mesures nécessaires.
    `;

    await this.send({
      type: "quality_fail",
      title: "Échec du contrôle qualité",
      message,
      recipients,
      priority: "high",
    });
  }

  static async notifyLotExpiring(
    lots: any[],
    recipients: string[]
  ): Promise<void> {
    const lotsList = lots
      .map(
        (lot) =>
          `- ${lot.id} (${lot.variety.name}) - Expire le ${lot.expiryDate}`
      )
      .join("\n");

    const message = `
      📅 LOTS EXPIRANT BIENTÔT
      
      Les lots suivants expirent dans moins de 30 jours :
      
      ${lotsList}
      
      Action requise : Planifier l'utilisation ou le renouvellement.
    `;

    await this.send({
      type: "expiring_lots",
      title: "Lots expirant bientôt",
      message,
      recipients,
      priority: "medium",
    });
  }

  private static async send(notification: {
    type: string;
    title: string;
    message: string;
    recipients: string[];
    priority: "low" | "medium" | "high";
  }): Promise<void> {
    // Implémentation des canaux de notification
    logger.info("Notification envoyée:", notification);

    // TODO: Implémenter l'envoi d'emails, webhooks, etc.
    // Pour l'instant, on log seulement
  }
}
