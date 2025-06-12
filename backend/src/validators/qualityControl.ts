// backend/src/validators/qualityControl.ts - ✅ CORRIGÉ AVEC VALEURS UI
import { z } from "zod";
import {
  percentageSchema,
  notesSchema,
  paginationSchema,
  positiveIdSchema,
  varietyIdSchema,
} from "./common";

// ✅ CORRECTION: Test results en format UI (minuscules)
export const TestResultEnum = z.enum(["pass", "fail"]);

// ✅ CORRECTION: Schéma de base sans refine pour permettre partial()
const baseQualityControlSchema = z.object({
  lotId: z.string().min(1, "ID de lot requis"),
  controlDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
    .refine((date) => {
      const controlDate = new Date(date);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return controlDate <= now && controlDate >= oneYearAgo;
    }, "Date doit être dans l'année écoulée"),
  germinationRate: percentageSchema,
  varietyPurity: percentageSchema,
  moistureContent: percentageSchema.optional(),
  seedHealth: percentageSchema.optional(),
  observations: notesSchema,
  testMethod: z.string().max(100).optional(),
  laboratoryRef: z.string().max(50).optional(),
  certificateUrl: z.string().url().optional(),
});

// ✅ CORRECTION: Schéma de création avec validation métier
export const createQualityControlSchema = baseQualityControlSchema.refine(
  (data) => {
    // Validation métier pour certification
    if (data.germinationRate < 60) return false;
    if (data.varietyPurity < 85) return false;
    return true;
  },
  {
    message:
      "Taux trop faibles pour certification (germination >= 60%, pureté >= 85%)",
    path: ["germinationRate"],
  }
);

// ✅ CORRECTION: Schéma de mise à jour avec valeurs UI - utilise baseSchema
export const updateQualityControlSchema = baseQualityControlSchema
  .partial()
  .extend({
    result: TestResultEnum.optional(), // ✅ CORRECTION: Valeurs UI "pass"/"fail"
  });

// ✅ CORRECTION: Schéma de requête avec valeurs UI
export const qualityControlQuerySchema = paginationSchema.extend({
  result: TestResultEnum.optional(), // ✅ CORRECTION: Valeurs UI "pass"/"fail"
  lotId: z.string().optional(),
  inspectorId: positiveIdSchema.optional(),
  varietyId: varietyIdSchema.optional(),
  multiplierId: positiveIdSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minGerminationRate: percentageSchema.optional(),
  maxGerminationRate: percentageSchema.optional(),
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

// Validation hiérarchie des lots (fonction utilitaire)
export const validateLotHierarchy = (
  parentLevel: string,
  childLevel: string
): boolean => {
  const hierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
  const parentIndex = hierarchy.indexOf(parentLevel);
  const childIndex = hierarchy.indexOf(childLevel);
  return parentIndex !== -1 && childIndex !== -1 && parentIndex < childIndex;
};

// Schéma pour la validation par lot
export const qualityControlByLotSchema = z.object({
  lotId: z.string().min(1, "ID de lot requis"),
  includeHistory: z.boolean().optional().default(false),
  limit: z.number().min(1).max(100).optional().default(10),
});

// Schéma pour les statistiques de qualité
export const qualityStatsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  varietyId: varietyIdSchema.optional(),
  multiplierId: positiveIdSchema.optional(),
  inspectorId: positiveIdSchema.optional(),
  groupBy: z.enum(["variety", "multiplier", "inspector", "month"]).optional(),
});

// Export des types pour réutilisation
export type CreateQualityControlInput = z.infer<
  typeof createQualityControlSchema
>;
export type UpdateQualityControlInput = z.infer<
  typeof updateQualityControlSchema
>;
export type QualityControlQueryInput = z.infer<
  typeof qualityControlQuerySchema
>;
