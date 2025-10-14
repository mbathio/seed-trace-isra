// backend/src/controllers/CertificateController.ts
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { ResponseHandler } from "../utils/response";

// =============================================================
// Contrôleur pour la gestion des certificats qualité (upload/download)
// =============================================================

export class CertificateController {
  /**
   * ✅ Upload d’un certificat PDF ou image lié à un contrôle qualité
   * Endpoint : POST /api/quality-controls/:id/certificate
   */
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return ResponseHandler.error(res, "ID invalide", 400);
      }

      // Vérification du fichier
      if (!req.file) {
        return ResponseHandler.error(res, "Fichier manquant", 422);
      }

      const filePath = `/uploads/${req.file.filename}`;

      // Mise à jour du contrôle qualité avec le lien du certificat
      const qc = await prisma.qualityControl.update({
        where: { id },
        data: { certificateUrl: filePath },
      });

      logger.info(`✅ Certificat associé au contrôle qualité #${id}`);
      return ResponseHandler.success(
        res,
        qc,
        "Certificat téléchargé avec succès"
      );
    } catch (error: any) {
      logger.error("❌ Erreur lors de l’upload du certificat :", error);
      return ResponseHandler.error(res, "Erreur interne du serveur", 500);
    }
  }

  /**
   * ✅ Téléchargement d’un certificat existant
   * Endpoint : GET /api/quality-controls/:id/certificate
   */
  static async download(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return ResponseHandler.error(res, "ID invalide", 400);
      }

      const qc = await prisma.qualityControl.findUnique({
        where: { id },
        select: { certificateUrl: true },
      });

      if (!qc || !qc.certificateUrl) {
        return ResponseHandler.notFound(res, "Certificat introuvable");
      }

      const filePath = path.resolve(qc.certificateUrl);
      if (!fs.existsSync(filePath)) {
        return ResponseHandler.notFound(
          res,
          "Fichier introuvable sur le disque"
        );
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="certificat-${id}.pdf"`
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      return;
    } catch (error: any) {
      logger.error("❌ Erreur lors du téléchargement du certificat :", error);
      return ResponseHandler.error(res, "Erreur interne du serveur", 500);
    }
  }
}
