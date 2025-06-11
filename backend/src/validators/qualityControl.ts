// backend/src/validators/qualityControl.ts - CORRIGÉ
import { z } from "zod";
import {
  TestResultEnum,
  percentageSchema,
  notesSchema,
  paginationSchema,
  positiveIdSchema,
} from "./common";

// ✅ CORRECTION: Validateur pour la création de contrôles qualité
export const createQualityControlSchema = z
  .object({
    lotId: z.string().min(1, "ID de lot requis"),
    controlDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Date de contrôle invalide")
      .refine((date) => {
        const controlDate = new Date(date);
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        return controlDate <= now && controlDate >= oneYearAgo;
      }, "Date de contrôle doit être dans l'année écoulée et pas dans le futur"),
    germinationRate: z
      .number()
      .min(0, "Taux de germination minimum 0%")
      .max(100, "Taux de germination maximum 100%"),
    varietyPurity: z
      .number()
      .min(0, "Pureté variétale minimum 0%")
      .max(100, "Pureté variétale maximum 100%"),
    moistureContent: z
      .number()
      .min(0, "Taux d'humidité minimum 0%")
      .max(100, "Taux d'humidité maximum 100%")
      .optional(),
    seedHealth: z
      .number()
      .min(0, "Santé des graines minimum 0%")
      .max(100, "Santé des graines maximum 100%")
      .optional(),
    observations: notesSchema,
    testMethod: z.string().max(100, "Méthode de test trop longue").optional(),
    laboratoryRef: z
      .string()
      .max(50, "Référence laboratoire trop longue")
      .optional(),
    certificateUrl: z.string().url("URL de certificat invalide").optional(),
  })
  .refine(
    (data) => {
      // ✅ CORRECTION: Validation des seuils de qualité
      if (data.germinationRate < 60) {
        return false; // Taux trop faible pour être certifiable
      }
      if (data.varietyPurity < 90) {
        return false; // Pureté trop faible
      }
      return true;
    },
    {
      message:
        "Taux de germination et pureté insuffisants pour la certification",
      path: ["germinationRate"],
    }
  )
  .refine(
    (data) => {
      // ✅ CORRECTION: Validation de cohérence humidité/santé
      if (data.moistureContent && data.moistureContent > 18) {
        return false; // Humidité trop élevée = problème de conservation
      }
      return true;
    },
    {
      message: "Taux d'humidité trop élevé (> 18%) - conservation impossible",
      path: ["moistureContent"],
    }
  );

// ✅ CORRECTION: Validateur pour la mise à jour de contrôles qualité
export const updateQualityControlSchema = z
  .object({
    germinationRate: percentageSchema.optional(),
    varietyPurity: percentageSchema.optional(),
    moistureContent: percentageSchema.optional(),
    seedHealth: percentageSchema.optional(),
    observations: notesSchema,
    testMethod: z.string().max(100, "Méthode de test trop longue").optional(),
    laboratoryRef: z
      .string()
      .max(50, "Référence laboratoire trop longue")
      .optional(),
    certificateUrl: z.string().url("URL de certificat invalide").optional(),
    // ✅ Note: Le résultat est calculé automatiquement
  })
  .refine(
    (data) => {
      // ✅ CORRECTION: Recalcul du résultat si les taux sont modifiés
      if (
        data.germinationRate !== undefined ||
        data.varietyPurity !== undefined
      ) {
        const germRate = data.germinationRate ?? 0;
        const purity = data.varietyPurity ?? 0;

        if (germRate < 60 || purity < 90) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Taux modifiés insuffisants pour maintenir la certification",
      path: ["germinationRate"],
    }
  );

// ✅ CORRECTION: Validateur pour les requêtes de recherche
export const qualityControlQuerySchema = paginationSchema.extend({
  result: TestResultEnum.optional(),
  lotId: z.string().optional(),
  inspectorId: positiveIdSchema.optional(),
  varietyId: z.union([z.number().positive(), z.string().min(1)]).optional(),
  multiplierId: positiveIdSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minGerminationRate: percentageSchema.optional(),
  maxGerminationRate: percentageSchema.optional(),
  minVarietyPurity: percentageSchema.optional(),
  maxVarietyPurity: percentageSchema.optional(),
  sortBy: z
    .enum([
      "controlDate",
      "germinationRate",
      "varietyPurity",
      "result",
      "lotId",
      "createdAt",
    ])
    .optional()
    .default("controlDate"),
});

// ✅ CORRECTION: Validateur pour les analyses statistiques
export const qualityStatsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z
    .enum(["variety", "multiplier", "level", "month", "inspector"])
    .optional()
    .default("variety"),
  includeRejected: z.boolean().optional().default(true),
  minSampleSize: z
    .number()
    .int("Taille d'échantillon doit être un entier")
    .min(1, "Taille d'échantillon minimum 1")
    .optional()
    .default(1),
});

// ✅ CORRECTION: Validateur pour les rapports de qualité
export const qualityReportSchema = z.object({
  type: z.enum(["SUMMARY", "DETAILED", "COMPARISON", "TREND"]),
  period: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  startDate: z.string(),
  endDate: z.string(),
  filters: z
    .object({
      varieties: z.array(z.string()).optional(),
      multipliers: z.array(z.number()).optional(),
      levels: z.array(z.string()).optional(),
      results: z.array(TestResultEnum).optional(),
    })
    .optional(),
  format: z.enum(["PDF", "EXCEL", "JSON", "HTML"]).optional().default("PDF"),
  includeCharts: z.boolean().optional().default(true),
  includeDetails: z.boolean().optional().default(false),
});

// ✅ CORRECTION: Validateur pour l'import en masse de contrôles
export const bulkQualityControlSchema = z.array(
  createQualityControlSchema.omit({ lotId: true }).extend({
    lotIdentifier: z.string().min(1, "Identifiant de lot requis"),
    inspectorEmail: z.string().email("Email inspecteur invalide").optional(),
  })
);

// ✅ CORRECTION: Validateur pour les seuils de qualité
export const qualityThresholdsSchema = z.object({
  level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]),
  minGerminationRate: percentageSchema,
  minVarietyPurity: percentageSchema,
  maxMoistureContent: percentageSchema.optional(),
  minSeedHealth: percentageSchema.optional(),
});

// ✅ CORRECTION: Validateur pour les alertes qualité
export const qualityAlertSchema = z.object({
  type: z.enum([
    "LOW_GERMINATION",
    "LOW_PURITY",
    "HIGH_MOISTURE",
    "FAILED_TEST",
  ]),
  threshold: percentageSchema,
  enabled: z.boolean().default(true),
  notifyInspectors: z.boolean().default(true),
  notifyManagers: z.boolean().default(true),
  emailTemplate: z.string().optional(),
});

// ✅ CORRECTION: Validateur pour les certificats
export const certificateGenerationSchema = z.object({
  qualityControlId: positiveIdSchema,
  format: z.enum(["PDF", "PNG", "SVG"]).default("PDF"),
  language: z.enum(["fr", "en", "wo"]).default("fr"), // français, anglais, wolof
  includeQRCode: z.boolean().default(true),
  includePhoto: z.boolean().default(false),
  template: z.enum(["STANDARD", "PREMIUM", "MINIMAL"]).default("STANDARD"),
});
