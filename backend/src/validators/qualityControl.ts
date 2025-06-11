// backend/src/validators/qualityControl.ts - ✅ CORRIGÉ COMPLET
import { z } from "zod";
import {
  TestResultEnum,
  percentageSchema,
  notesSchema,
  paginationSchema,
  positiveIdSchema,
} from "./common";

// ✅ CORRECTION 1: Schémas de validation des seuils qualité par niveau
const qualityThresholdsByLevel: Record<
  string,
  { minGermination: number; minPurity: number }
> = {
  GO: { minGermination: 98, minPurity: 99.9 },
  G1: { minGermination: 95, minPurity: 99.5 },
  G2: { minGermination: 90, minPurity: 99.0 },
  G3: { minGermination: 85, minPurity: 98.0 },
  G4: { minGermination: 80, minPurity: 97.0 },
  R1: { minGermination: 80, minPurity: 97.0 },
  R2: { minGermination: 80, minPurity: 95.0 },
};

// ✅ CORRECTION 2: Fonction de validation métier des résultats
const validateQualityResult = (
  germinationRate: number,
  varietyPurity: number,
  seedLevel: string
): TestResultEnum => {
  const thresholds =
    qualityThresholdsByLevel[seedLevel] || qualityThresholdsByLevel["R2"];

  return germinationRate >= thresholds.minGermination &&
    varietyPurity >= thresholds.minPurity
    ? "PASS"
    : "FAIL";
};

// ✅ CORRECTION 3: Schéma de création avec validations métier avancées
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
      // ✅ Validation croisée: taux d'humidité cohérent avec santé des graines
      if (data.moistureContent && data.seedHealth) {
        // Si humidité > 14%, santé des graines devrait être < 90%
        if (data.moistureContent > 14 && data.seedHealth > 90) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Taux d'humidité élevé incohérent avec une santé élevée des graines",
      path: ["seedHealth"],
    }
  )
  .refine(
    (data) => {
      // ✅ Validation métier: alertes sur taux faibles
      if (data.germinationRate < 60) {
        return false; // Taux critique
      }
      return true;
    },
    {
      message: "Taux de germination critique (< 60%) - Vérifiez les données",
      path: ["germinationRate"],
    }
  )
  .refine(
    (data) => {
      // ✅ Validation métier: pureté variétale cohérente
      if (data.varietyPurity < 85) {
        return false; // Pureté trop faible pour être certifiable
      }
      return true;
    },
    {
      message: "Pureté variétale trop faible (< 85%) pour certification",
      path: ["varietyPurity"],
    }
  );

// ✅ CORRECTION 4: Schéma de mise à jour indépendant
export const updateQualityControlSchema = z
  .object({
    germinationRate: z
      .number()
      .min(0, "Taux de germination minimum 0%")
      .max(100, "Taux de germination maximum 100%")
      .optional(),
    varietyPurity: z
      .number()
      .min(0, "Pureté variétale minimum 0%")
      .max(100, "Pureté variétale maximum 100%")
      .optional(),
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
    result: TestResultEnum.optional(), // Permettre mise à jour manuelle du résultat
  })
  .refine(
    (data) => {
      // ✅ Validation de cohérence lors mise à jour
      if (
        data.germinationRate !== undefined &&
        data.varietyPurity !== undefined
      ) {
        // Si les deux taux sont fournis, vérifier cohérence avec résultat
        if (data.result) {
          const expectedResult =
            data.germinationRate >= 80 && data.varietyPurity >= 95
              ? "PASS"
              : "FAIL";
          return data.result === expectedResult;
        }
      }
      return true;
    },
    {
      message: "Résultat incohérent avec les taux fournis",
      path: ["result"],
    }
  );

// ✅ CORRECTION 5: Schéma de requête avec validation étendue
export const qualityControlQuerySchema = paginationSchema
  .extend({
    result: TestResultEnum.optional(),
    lotId: z.string().optional(),
    inspectorId: positiveIdSchema.optional(),
    varietyId: z.union([z.number().positive(), z.string().min(1)]).optional(),
    multiplierId: positiveIdSchema.optional(),
    startDate: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return !isNaN(Date.parse(date));
      }, "Date de début invalide"),
    endDate: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return !isNaN(Date.parse(date));
      }, "Date de fin invalide"),
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
  })
  .refine(
    (data) => {
      // Validation de plage de dates
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start <= end;
      }
      return true;
    },
    {
      message: "Date de fin doit être postérieure à la date de début",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // Validation des plages de taux de germination
      if (data.minGerminationRate && data.maxGerminationRate) {
        return data.minGerminationRate <= data.maxGerminationRate;
      }
      return true;
    },
    {
      message: "Taux de germination max doit être supérieur au minimum",
      path: ["maxGerminationRate"],
    }
  )
  .refine(
    (data) => {
      // Validation des plages de pureté variétale
      if (data.minVarietyPurity && data.maxVarietyPurity) {
        return data.minVarietyPurity <= data.maxVarietyPurity;
      }
      return true;
    },
    {
      message: "Pureté variétale max doit être supérieure au minimum",
      path: ["maxVarietyPurity"],
    }
  );

// ✅ CORRECTION 6: Schéma de statistiques qualité
export const qualityStatsQuerySchema = z
  .object({
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
  })
  .refine(
    (data) => {
      // Validation de plage de dates pour statistiques
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const diffInDays =
          (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

        // Limiter à 2 ans pour éviter les requêtes trop lourdes
        return diffInDays <= 730;
      }
      return true;
    },
    {
      message: "Période trop longue (maximum 2 ans)",
      path: ["endDate"],
    }
  );

// ✅ CORRECTION 7: Schéma de rapport de qualité
export const qualityReportSchema = z
  .object({
    type: z.enum(["SUMMARY", "DETAILED", "COMPARISON", "TREND"]),
    period: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Date début invalide"),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Date fin invalide"),
    filters: z
      .object({
        varieties: z.array(z.string()).optional(),
        multipliers: z.array(z.number()).optional(),
        levels: z.array(z.string()).optional(),
        results: z.array(TestResultEnum).optional(),
        inspectors: z.array(z.number()).optional(),
      })
      .optional(),
    format: z.enum(["PDF", "EXCEL", "JSON", "HTML"]).optional().default("PDF"),
    includeCharts: z.boolean().optional().default(true),
    includeDetails: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // Validation de cohérence type/période
      if (data.type === "TREND" && data.period === "DAILY") {
        return false; // Tendance quotidienne peu pertinente
      }
      return true;
    },
    {
      message: "Combinaison type/période non recommandée",
      path: ["period"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "Date de fin doit être postérieure à la date de début",
      path: ["endDate"],
    }
  );

// ✅ CORRECTION 8: Schéma d'import en masse avec validation renforcée
export const bulkQualityControlSchema = z
  .array(
    z.object({
      lotIdentifier: z.string().min(1, "Identifiant de lot requis"),
      controlDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
      germinationRate: z.number().min(0).max(100),
      varietyPurity: z.number().min(0).max(100),
      moistureContent: z.number().min(0).max(100).optional(),
      seedHealth: z.number().min(0).max(100).optional(),
      observations: z.string().max(1000).optional(),
      testMethod: z.string().max(100).optional(),
      inspectorEmail: z.string().email("Email inspecteur invalide").optional(),
      laboratoryRef: z.string().max(50).optional(),
      rowNumber: z.number().optional(), // Pour traçabilité des erreurs
    })
  )
  .min(1, "Au moins un contrôle requis")
  .max(500, "Maximum 500 contrôles par import")
  .refine(
    (data) => {
      // Vérifier l'unicité des identifiants de lot par date
      const lotDateCombos = data.map(
        (item) => `${item.lotIdentifier}-${item.controlDate}`
      );
      const uniqueCombos = new Set(lotDateCombos);
      return lotDateCombos.length === uniqueCombos.size;
    },
    {
      message:
        "Doublons détectés: même lot contrôlé plusieurs fois à la même date",
    }
  );

// ✅ CORRECTION 9: Schéma de seuils de qualité par niveau
export const qualityThresholdsSchema = z
  .object({
    level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]),
    minGerminationRate: percentageSchema,
    minVarietyPurity: percentageSchema,
    maxMoistureContent: percentageSchema.optional(),
    minSeedHealth: percentageSchema.optional(),
  })
  .refine(
    (data) => {
      // Validation de cohérence des seuils selon le niveau
      const defaultThresholds = qualityThresholdsByLevel[data.level];
      if (defaultThresholds) {
        // Pas trop en dessous des standards
        return (
          data.minGerminationRate >= defaultThresholds.minGermination - 10 &&
          data.minVarietyPurity >= defaultThresholds.minPurity - 5
        );
      }
      return true;
    },
    {
      message: "Seuils trop bas par rapport aux standards du niveau",
      path: ["minGerminationRate"],
    }
  );

// ✅ CORRECTION 10: Schéma d'alertes qualité
export const qualityAlertSchema = z
  .object({
    type: z.enum([
      "LOW_GERMINATION",
      "LOW_PURITY",
      "HIGH_MOISTURE",
      "FAILED_TEST",
      "CONSECUTIVE_FAILURES",
      "UNUSUAL_VALUES",
    ]),
    threshold: percentageSchema,
    enabled: z.boolean().default(true),
    notifyInspectors: z.boolean().default(true),
    notifyManagers: z.boolean().default(true),
    emailTemplate: z.string().optional(),
    frequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY"]).default("IMMEDIATE"),
    conditions: z
      .object({
        minOccurrences: z.number().min(1).optional(),
        timeWindow: z.number().min(1).optional(), // en jours
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Validation de cohérence type/seuil
      if (data.type === "HIGH_MOISTURE" && data.threshold < 10) {
        return false; // Seuil d'humidité trop bas
      }
      if (data.type === "LOW_GERMINATION" && data.threshold > 50) {
        return false; // Seuil de germination trop haut pour alerte
      }
      return true;
    },
    {
      message: "Seuil incohérent avec le type d'alerte",
      path: ["threshold"],
    }
  );

// ✅ CORRECTION 11: Schéma de génération de certificats
export const certificateGenerationSchema = z.object({
  qualityControlId: positiveIdSchema,
  format: z.enum(["PDF", "PNG", "SVG"]).default("PDF"),
  language: z.enum(["fr", "en", "wo"]).default("fr"), // français, anglais, wolof
  includeQRCode: z.boolean().default(true),
  includePhoto: z.boolean().default(false),
  template: z.enum(["STANDARD", "PREMIUM", "MINIMAL"]).default("STANDARD"),
  customData: z
    .object({
      organization: z.string().max(100).optional(),
      signatory: z.string().max(100).optional(),
      validityPeriod: z.number().min(1).max(365).optional(), // jours
    })
    .optional(),
});

// ✅ CORRECTION 12: Schéma de validation des méthodes de test
export const testMethodSchema = z.object({
  name: z.string().min(1, "Nom de méthode requis").max(100),
  description: z.string().max(500).optional(),
  standardReference: z.string().max(100).optional(), // ex: "ISTA 2019"
  parameters: z
    .array(
      z.object({
        name: z.string(),
        value: z.union([z.string(), z.number()]),
        unit: z.string().optional(),
      })
    )
    .optional(),
  isActive: z.boolean().default(true),
});

// ✅ CORRECTION 13: Schéma de comparaison de contrôles
export const compareQualityControlsSchema = z.object({
  controlIds: z
    .array(positiveIdSchema)
    .min(2, "Au moins 2 contrôles requis")
    .max(10, "Maximum 10 contrôles"),
  includeCharts: z.boolean().default(true),
  comparisonType: z
    .enum(["ABSOLUTE", "RELATIVE", "STATISTICAL"])
    .default("ABSOLUTE"),
});

// ✅ CORRECTION 14: Utilitaires de validation
export const validateGerminationTest = (
  germinationRate: number,
  testConditions: {
    temperature?: number;
    humidity?: number;
    duration?: number; // en jours
  }
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  let isValid = true;

  // Validation des conditions de test
  if (testConditions.temperature) {
    if (testConditions.temperature < 15 || testConditions.temperature > 30) {
      warnings.push("Température de test hors norme (15-30°C)");
    }
  }

  if (testConditions.humidity) {
    if (testConditions.humidity < 90 || testConditions.humidity > 100) {
      warnings.push("Humidité de test non optimale (90-100%)");
    }
  }

  if (testConditions.duration) {
    if (testConditions.duration < 7 || testConditions.duration > 14) {
      warnings.push("Durée de test atypique (7-14 jours standard)");
    }
  }

  // Validation du taux selon les conditions
  if (germinationRate < 50) {
    isValid = false;
  } else if (germinationRate < 70) {
    warnings.push("Taux de germination faible");
  }

  return { isValid, warnings };
};

// ✅ CORRECTION 15: Export des fonctions utilitaires
export {
  validateQualityResult,
  qualityThresholdsByLevel,
  validateGerminationTest,
};
