// backend/src/validators/multipliers.ts - VERSION UNIFIÉE
import { z } from "zod";
import { MultiplierStatus, CertificationLevel, CropType } from "@prisma/client"; // ✅ Enums Prisma directs
import { coordinatesSchema, phoneSchema, emailSchema } from "./common";

// 🔹 Schéma création d'un multiplicateur
export const createMultiplierSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  ...coordinatesSchema.shape, // Spread des coordonnées validées
  yearsExperience: z.number().int().min(0).max(50),
  certificationLevel: z.nativeEnum(CertificationLevel),
  specialization: z.array(z.nativeEnum(CropType)).min(1).max(6),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  status: z
    .nativeEnum(MultiplierStatus)
    .optional()
    .default(MultiplierStatus.active),
});

// 🔹 Schéma mise à jour (partial)
export const updateMultiplierSchema = createMultiplierSchema.partial();

// 🔹 Schéma de requête
export const multiplierQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(MultiplierStatus).optional(),
  certificationLevel: z.nativeEnum(CertificationLevel).optional(),
  sortBy: z
    .enum(["name", "certificationLevel", "yearsExperience", "createdAt"])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// 🔹 Types TypeScript
export type CreateMultiplierInput = z.infer<typeof createMultiplierSchema>;
export type UpdateMultiplierInput = z.infer<typeof updateMultiplierSchema>;
export type MultiplierQueryInput = z.infer<typeof multiplierQuerySchema>;
