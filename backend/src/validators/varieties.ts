// backend/src/validators/varieties.ts - VERSION UNIFIÉE
import { z } from "zod";
import { CropType } from "@prisma/client"; // ✅ Enum Prisma direct

// 🔹 Schéma de création de variété
export const createVarietySchema = z.object({
  code: z
    .string()
    .min(2, "Code trop court")
    .max(20, "Code trop long")
    .regex(/^[A-Z0-9_-]+$/, "Code invalide (majuscules, chiffres, tirets)")
    .transform((val) => val.toUpperCase()),
  name: z.string().min(2, "Nom trop court").max(100, "Nom trop long"),
  cropType: z.nativeEnum(CropType), // ✅ Utilisation directe de l’enum Prisma
  description: z.string().max(1000).optional(),
  maturityDays: z.number().int().min(30).max(365),
  yieldPotential: z.number().positive().max(50).optional(),
  resistances: z.array(z.string()).max(20).optional().default([]),
  origin: z.string().max(100).optional(),
  releaseYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
});

// 🔹 Schéma de mise à jour
export const updateVarietySchema = createVarietySchema
  .partial()
  .omit({ code: true }); // Le code ne peut pas être modifié

// 🔹 Schéma de requête pour pagination et filtrage
export const varietyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  cropType: z.nativeEnum(CropType).optional(), // ✅ Enum Prisma direct
  sortBy: z.enum(["name", "code", "cropType", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// 🔹 Types TypeScript
export type CreateVarietyInput = z.infer<typeof createVarietySchema>;
export type UpdateVarietyInput = z.infer<typeof updateVarietySchema>;
export type VarietyQueryInput = z.infer<typeof varietyQuerySchema>;
