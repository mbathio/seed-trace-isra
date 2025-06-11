// backend/src/validators/common.ts - VERSION CORRIGÉE COMPLÈTE
import { z } from "zod";

// Enums avec validation stricte - VALEURS DB
export const RoleEnum = z.enum([
  "ADMIN",
  "MANAGER",
  "INSPECTOR",
  "MULTIPLIER",
  "GUEST",
  "TECHNICIAN",
  "RESEARCHER",
]);

export const SeedLevelEnum = z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]);

export const CropTypeEnum = z.enum([
  "RICE",
  "MAIZE",
  "PEANUT",
  "SORGHUM",
  "COWPEA",
  "MILLET",
]);

export const LotStatusEnum = z.enum([
  "PENDING",
  "CERTIFIED",
  "REJECTED",
  "IN_STOCK",
  "SOLD",
  "ACTIVE",
  "DISTRIBUTED",
]);

export const MultiplierStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const CertificationLevelEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "EXPERT",
]);

export const ParcelStatusEnum = z.enum(["AVAILABLE", "IN_USE", "RESTING"]);

export const ContractStatusEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const ProductionStatusEnum = z.enum([
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const ActivityTypeEnum = z.enum([
  "SOIL_PREPARATION",
  "SOWING",
  "FERTILIZATION",
  "IRRIGATION",
  "WEEDING",
  "PEST_CONTROL",
  "HARVEST",
  "OTHER",
]);

export const IssueTypeEnum = z.enum([
  "DISEASE",
  "PEST",
  "WEATHER",
  "MANAGEMENT",
  "OTHER",
]);

export const IssueSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const TestResultEnum = z.enum(["PASS", "FAIL"]);

export const ReportTypeEnum = z.enum([
  "PRODUCTION",
  "QUALITY",
  "INVENTORY",
  "MULTIPLIER_PERFORMANCE",
  "CUSTOM",
]);

// Schémas de base réutilisables
export const paginationSchema = z.object({
  page: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    return Math.max(1, isNaN(num) ? 1 : num);
  }),
  pageSize: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    return Math.min(Math.max(1, isNaN(num) ? 10 : num), 100);
  }),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Coordonnées GPS avec validation Sénégal
export const coordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .refine((lat) => lat >= 12.0 && lat <= 16.7, {
      message: "Coordonnées en dehors du Sénégal",
    }),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .refine((lng) => lng >= -17.6 && lng <= -11.3, {
      message: "Coordonnées en dehors du Sénégal",
    }),
});

// Dates avec validation
export const dateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
  .transform((date) => new Date(date));

export const optionalDateSchema = z
  .string()
  .optional()
  .refine((date) => !date || !isNaN(Date.parse(date)), "Date invalide")
  .transform((date) => (date ? new Date(date) : undefined));

// Entiers positifs
export const positiveIntSchema = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num) || num <= 0) {
      throw new Error("Doit être un entier positif");
    }
    return num;
  });

// Pourcentages
export const percentageSchema = z
  .number()
  .min(0, "Pourcentage doit être >= 0")
  .max(100, "Pourcentage doit être <= 100");

// Email
export const emailSchema = z
  .string()
  .email("Email invalide")
  .toLowerCase()
  .transform((email) => email.trim());

// Téléphone sénégalais
export const phoneSchema = z
  .string()
  .optional()
  .transform((phone) => phone?.replace(/\s+/g, ""))
  .refine((phone) => {
    if (!phone) return true;
    const phoneRegex = /^(\+221)?[0-9]{8,9}$/;
    return phoneRegex.test(phone);
  }, "Numéro de téléphone sénégalais invalide");

// Variety ID (peut être numérique ou string)
export const varietyIdSchema = z.union([
  z.number().positive(),
  z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, "Code variété invalide"),
]);

// Notes/observations
export const notesSchema = z
  .string()
  .max(1000, "Notes ne peuvent pas dépasser 1000 caractères")
  .optional()
  .transform((notes) => notes?.trim() || undefined);

// ID positif générique
export const positiveIdSchema = z.union([
  z.number().positive(),
  z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("ID invalide");
    }
    return parsed;
  }),
]);

// Multiplier ID
export const multiplierIdSchema = positiveIdSchema;

// Utilitaires de validation
export const ValidationUtils = {
  validateLotId: (lotId: string): boolean => {
    const lotIdRegex = /^SL-(GO|G[1-4]|R[1-2])-\d{4}-\d{3}$/;
    return lotIdRegex.test(lotId);
  },

  isInSenegal: (lat: number, lng: number): boolean => {
    return lat >= 12.0 && lat <= 16.7 && lng >= -17.6 && lng <= -11.3;
  },

  sanitizeText: (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[<>'"]/g, "");
  },
};
