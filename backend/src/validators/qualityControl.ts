// backend/src/validators/qualityControl.ts
import { z } from "zod";

export const createQualityControlSchema = z.object({
  lotId: z.string().min(1, "ID de lot requis"),
  controlDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
  germinationRate: z
    .number()
    .min(0)
    .max(100, "Le taux de germination doit être entre 0 et 100"),
  varietyPurity: z
    .number()
    .min(0)
    .max(100, "La pureté variétale doit être entre 0 et 100"),
  moistureContent: z.number().min(0).max(100).optional(),
  seedHealth: z.number().min(0).max(100).optional(),
  observations: z.string().optional(),
  testMethod: z.string().optional(),
});

export const updateQualityControlSchema = z.object({
  germinationRate: z.number().min(0).max(100).optional(),
  varietyPurity: z.number().min(0).max(100).optional(),
  moistureContent: z.number().min(0).max(100).optional(),
  seedHealth: z.number().min(0).max(100).optional(),
  observations: z.string().optional(),
  testMethod: z.string().optional(),
  // ✅ Note: Le résultat est calculé automatiquement, pas besoin de le valider
});
