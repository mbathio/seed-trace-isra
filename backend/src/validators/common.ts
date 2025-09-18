// backend/src/validators/common.ts - VERSION UNIFIÉE (utilise directement les enums Prisma)
import { z } from "zod";
import {
  Role,
  SeedLevel,
  CropType,
  LotStatus,
  MultiplierStatus,
  CertificationLevel,
  ParcelStatus,
  ContractStatus,
  ProductionStatus,
  ActivityType,
  IssueType,
  IssueSeverity,
  TestResult,
  ReportType,
} from "@prisma/client";

// ✅ NOUVEAUX ENUMS : Utilisent directement les valeurs Prisma
export const RoleEnum = z.nativeEnum(Role, {
  errorMap: (issue, _ctx) => ({
    message: `Rôle invalide. Valeurs acceptées: ${Object.values(Role).join(
      ", "
    )}.`,
  }),
});

export const SeedLevelEnum = z.nativeEnum(SeedLevel, {
  errorMap: (issue, _ctx) => ({
    message: `Niveau de semence invalide. Valeurs acceptées: ${Object.values(
      SeedLevel
    ).join(", ")}.`,
  }),
});

export const CropTypeEnum = z.nativeEnum(CropType, {
  errorMap: (issue, _ctx) => ({
    message: `Type de culture invalide. Valeurs acceptées: ${Object.values(
      CropType
    ).join(", ")}.`,
  }),
});

export const LotStatusEnum = z.nativeEnum(LotStatus, {
  errorMap: (issue, _ctx) => ({
    message: `Statut de lot invalide. Valeurs acceptées: ${Object.values(
      LotStatus
    ).join(", ")}.`,
  }),
});

export const MultiplierStatusEnum = z.nativeEnum(MultiplierStatus, {
  errorMap: (issue, _ctx) => ({
    message: `Statut multiplicateur invalide. Valeurs acceptées: ${Object.values(
      MultiplierStatus
    ).join(", ")}.`,
  }),
});

export const CertificationLevelEnum = z.nativeEnum(CertificationLevel, {
  errorMap: (issue, _ctx) => ({
    message: `Niveau de certification invalide. Valeurs acceptées: ${Object.values(
      CertificationLevel
    ).join(", ")}.`,
  }),
});

export const ParcelStatusEnum = z.nativeEnum(ParcelStatus, {
  errorMap: (issue, _ctx) => ({
    message: `Statut de parcelle invalide. Valeurs acceptées: ${Object.values(
      ParcelStatus
    ).join(", ")}.`,
  }),
});

export const ContractStatusEnum = z.nativeEnum(ContractStatus, {
  errorMap: (issue, _ctx) => ({
    message: `Statut de contrat invalide. Valeurs acceptées: ${Object.values(
      ContractStatus
    ).join(", ")}.`,
  }),
});

export const ProductionStatusEnum = z.nativeEnum(ProductionStatus, {
  errorMap: (issue, _ctx) => ({
    message: `Statut de production invalide. Valeurs acceptées: ${Object.values(
      ProductionStatus
    ).join(", ")}.`,
  }),
});

export const ActivityTypeEnum = z.nativeEnum(ActivityType, {
  errorMap: (issue, _ctx) => ({
    message: `Type d'activité invalide. Valeurs acceptées: ${Object.values(
      ActivityType
    ).join(", ")}.`,
  }),
});

export const IssueTypeEnum = z.nativeEnum(IssueType, {
  errorMap: (issue, _ctx) => ({
    message: `Type de problème invalide. Valeurs acceptées: ${Object.values(
      IssueType
    ).join(", ")}.`,
  }),
});

export const IssueSeverityEnum = z.nativeEnum(IssueSeverity, {
  errorMap: (issue, _ctx) => ({
    message: `Sévérité invalide. Valeurs acceptées: ${Object.values(
      IssueSeverity
    ).join(", ")}.`,
  }),
});

export const TestResultEnum = z.nativeEnum(TestResult, {
  errorMap: (issue, _ctx) => ({
    message: `Résultat de test invalide. Valeurs acceptées: ${Object.values(
      TestResult
    ).join(", ")}.`,
  }),
});

export const ReportTypeEnum = z.nativeEnum(ReportType, {
  errorMap: (issue, _ctx) => ({
    message: `Type de rapport invalide. Valeurs acceptées: ${Object.values(
      ReportType
    ).join(", ")}.`,
  }),
});

// Schémas de base réutilisables (inchangés)
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

  isValidCoordinates: (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^(\+221)?[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  },

  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidSeedLevel: (level: string): boolean => {
    return Object.values(SeedLevel).includes(level as SeedLevel);
  },

  sanitizeText: (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[<>'"]/g, "");
  },
};
