// backend/src/validators/qualityControl.ts - CORRIGÉ
import { z } from "zod";
import {
  TestResultEnum,
  percentageSchema,
  notesSchema,
  paginationSchema,
  positiveIdSchema,
} from "./common";

export const createQualityControlSchema = z
  .object({
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
  })
  .refine(
    (data) => {
      // Validation métier
      if (data.germinationRate < 60) return false;
      if (data.varietyPurity < 85) return false;
      return true;
    },
    {
      message: "Taux trop faibles pour certification",
      path: ["germinationRate"],
    }
  );

export const updateQualityControlSchema = createQualityControlSchema
  .partial()
  .extend({
    result: TestResultEnum.optional(),
  });

export const qualityControlQuerySchema = paginationSchema.extend({
  result: TestResultEnum.optional(),
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

// Export des utilitaires
export { validateLotHierarchy };
