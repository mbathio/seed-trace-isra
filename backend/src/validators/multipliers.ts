// backend/src/validators/multipliers.ts - VERSION UNIFIÉE
import { z } from "zod";
import {
  MultiplierStatusEnum,
  CertificationLevelEnum,
  CropTypeEnum,
  coordinatesSchema,
  phoneSchema,
  emailSchema,
} from "./common";

export const createMultiplierSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  ...coordinatesSchema.shape, // Spread des coordonnées validées
  yearsExperience: z.number().int().min(0).max(50),
  certificationLevel: CertificationLevelEnum, // ✅ Utilise directement l'enum Prisma
  specialization: z.array(CropTypeEnum).min(1).max(6), // ✅ Array d'enums Prisma
  phone: phoneSchema,
  email: emailSchema,
  status: MultiplierStatusEnum.optional().default("ACTIVE"),
});

export const updateMultiplierSchema = createMultiplierSchema.partial();

export const multiplierQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: MultiplierStatusEnum.optional(),
  certificationLevel: CertificationLevelEnum.optional(),
  sortBy: z
    .enum(["name", "certificationLevel", "yearsExperience", "createdAt"])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
