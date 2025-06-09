// backend/src/routes/export.ts - Routes d'export corrigées
import { Router } from "express";
import { ExportController } from "../controllers/ExportController";
import { authMiddleware, requireRole } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { z } from "zod";

const router = Router();

// ✅ Schémas de validation pour les paramètres d'export
const seedLotExportSchema = z.object({
  format: z.enum(["csv", "xlsx", "json"]).optional().default("csv"),
  level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]).optional(),
  status: z
    .enum([
      "PENDING",
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
    ])
    .optional(),
  varietyId: z.union([z.string(), z.number()]).optional(),
  multiplierId: z.union([z.string(), z.number()]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

const qualityReportExportSchema = z.object({
  format: z.enum(["html", "pdf", "json", "xlsx"]).optional().default("html"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  result: z.enum(["PASS", "FAIL"]).optional(),
  varietyId: z.union([z.string(), z.number()]).optional(),
  inspectorId: z.union([z.string(), z.number()]).optional(),
  lotId: z.string().optional(),
});

const productionStatsExportSchema = z.object({
  format: z.enum(["xlsx", "csv", "json"]).optional().default("xlsx"),
  year: z.union([z.string(), z.number()]).optional(),
  multiplierId: z.union([z.string(), z.number()]).optional(),
  varietyId: z.union([z.string(), z.number()]).optional(),
  status: z
    .enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
});

// ✅ Middleware d'authentification pour toutes les routes d'export
router.use(authMiddleware);

// ✅ GET /api/export/formats - Obtenir les formats disponibles (accessible à tous les utilisateurs authentifiés)
router.get("/formats", ExportController.getAvailableFormats);

// ✅ GET /api/export/seed-lots - Export des lots de semences
router.get(
  "/seed-lots",
  requireRole("MANAGER", "ADMIN", "RESEARCHER", "INSPECTOR"),
  validateRequest({ query: seedLotExportSchema }),
  ExportController.exportSeedLots
);

// ✅ GET /api/export/quality-report - Export du rapport de qualité
router.get(
  "/quality-report",
  requireRole("MANAGER", "ADMIN", "INSPECTOR", "RESEARCHER"),
  validateRequest({ query: qualityReportExportSchema }),
  ExportController.exportQualityReport
);

// ✅ GET /api/export/production-stats - Export des statistiques de production
router.get(
  "/production-stats",
  requireRole("MANAGER", "ADMIN", "RESEARCHER"),
  validateRequest({ query: productionStatsExportSchema }),
  ExportController.exportProductionStats
);

export default router;
