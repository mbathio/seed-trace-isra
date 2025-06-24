import { z } from "zod";
import {
  percentageSchema,
  notesSchema,
  paginationSchema,
  positiveIdSchema,
  varietyIdSchema,
} from "./common";

// Test results en format UI (minuscules)
export const TestResultEnum = z.enum(["pass", "fail"]);

// Schéma de base pour réutilisation
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

// Schéma de création avec validation métier
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

// Schéma de mise à jour
export const updateQualityControlSchema = baseQualityControlSchema
  .partial()
  .extend({
    result: TestResultEnum.optional(), // Valeurs UI "pass"/"fail"
  });

// Schéma de requête
export const qualityControlQuerySchema = paginationSchema.extend({
  result: TestResultEnum.optional(), // Valeurs UI "pass"/"fail"
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

// Export des types
export type CreateQualityControlInput = z.infer<
  typeof createQualityControlSchema
>;
export type UpdateQualityControlInput = z.infer<
  typeof updateQualityControlSchema
>;
export type QualityControlQueryInput = z.infer<
  typeof qualityControlQuerySchema
>;
