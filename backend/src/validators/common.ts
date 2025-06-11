// backend/src/validators/common.ts - Enums et validateurs communs CORRIGÉS
import { z } from "zod";

// ✅ CORRECTION: Enums standardisés (cohérents avec Prisma)
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

// ✅ CORRECTION: Validateurs communs réutilisables
export const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val) : val;
      return Math.max(1, isNaN(num) ? 1 : num);
    })
    .refine((n) => n > 0, "Page doit être positive"),
  pageSize: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val) : val;
      return Math.min(Math.max(1, isNaN(num) ? 10 : num), 100);
    })
    .refine((n) => n > 0 && n <= 100, "PageSize doit être entre 1 et 100"),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const coordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude doit être >= -90")
    .max(90, "Latitude doit être <= 90"),
  longitude: z
    .number()
    .min(-180, "Longitude doit être >= -180")
    .max(180, "Longitude doit être <= 180"),
});

export const dateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
  .transform((date) => new Date(date));

export const optionalDateSchema = dateSchema.optional();

export const positiveIntSchema = z
  .number()
  .int("Doit être un entier")
  .positive("Doit être positif");

export const percentageSchema = z
  .number()
  .min(0, "Pourcentage doit être >= 0")
  .max(100, "Pourcentage doit être <= 100");

export const emailSchema = z.string().email("Email invalide").toLowerCase();

export const phoneSchema = z
  .string()
  .regex(/^(\+221)?[0-9]{8,9}$/, "Numéro de téléphone sénégalais invalide")
  .optional();

// ✅ CORRECTION: Schéma flexible pour varietyId (nombre ou code string)
export const varietyIdSchema = z.union([
  z.number().positive("ID variété doit être positif"),
  z.string().min(1, "Code variété requis"),
]);

// ✅ CORRECTION: Schéma flexible pour multiplierIdSchema
export const multiplierIdSchema = z.union([
  z.number().positive("ID multiplicateur doit être positif"),
  z.string().transform((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("ID multiplicateur invalide");
    }
    return parsed;
  }),
]);

// ✅ CORRECTION: Validateur de coordonnées spécifique au Sénégal
export const senegalCoordinatesSchema = coordinatesSchema.refine(
  ({ latitude, longitude }) => {
    const bounds = {
      latMin: 12.0,
      latMax: 16.7,
      lngMin: -17.6,
      lngMax: -11.3,
    };
    return (
      latitude >= bounds.latMin &&
      latitude <= bounds.latMax &&
      longitude >= bounds.lngMin &&
      longitude <= bounds.lngMax
    );
  },
  "Coordonnées en dehors du Sénégal"
);

// ✅ CORRECTION: Validateurs d'ID avec transformation sécurisée
export const positiveIdSchema = z.union([
  z.number().positive(),
  z.string().transform((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("ID invalide");
    }
    return parsed;
  }),
]);

// ✅ CORRECTION: Validateur de quantité avec unités
export const quantitySchema = z.object({
  value: z.number().positive("Quantité doit être positive"),
  unit: z.enum(["kg", "g", "t", "units"]).default("kg"),
});

// ✅ CORRECTION: Validateur pour les résistances de variétés
export const resistancesSchema = z
  .array(z.string().min(1, "Résistance ne peut pas être vide"))
  .max(20, "Maximum 20 résistances autorisées")
  .optional()
  .default([]);

// ✅ CORRECTION: Validateur pour les spécialisations
export const specializationsSchema = z
  .array(CropTypeEnum)
  .min(1, "Au moins une spécialisation requise")
  .max(6, "Maximum 6 spécialisations autorisées");

// ✅ CORRECTION: Validateur pour les notes/observations
export const notesSchema = z
  .string()
  .max(1000, "Notes ne peuvent pas dépasser 1000 caractères")
  .optional();

// ✅ CORRECTION: Validateur de période de dates
export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(
    ({ startDate, endDate }) => startDate <= endDate,
    "Date de fin doit être après la date de début"
  );

// ✅ CORRECTION: Validateur pour les filtres de recherche
export const searchFiltersSchema = z.object({
  search: z.string().max(100, "Recherche trop longue").optional(),
  level: SeedLevelEnum.optional(),
  status: LotStatusEnum.optional(),
  cropType: CropTypeEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  varietyId: varietyIdSchema.optional(),
  multiplierId: multiplierIdSchema.optional(),
  parcelId: positiveIdSchema.optional(),
});
