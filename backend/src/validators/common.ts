// backend/src/validators/common.ts - Enums et validateurs communs
import { z } from "zod";

// ✅ Enums standardisés (cohérents avec Prisma)
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

// ✅ Validateurs communs réutilisables
export const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Math.max(1, parseInt(val.toString()) || 1))
    .refine((n) => n > 0, "Page doit être positive"),
  pageSize: z
    .union([z.string(), z.number()])
    .transform((val) =>
      Math.min(Math.max(1, parseInt(val.toString()) || 10), 100)
    )
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

// ✅ Schéma flexible pour varietyId (nombre ou code string)
export const varietyIdSchema = z.union([
  z.number().positive(),
  z.string().min(1),
]);

// ✅ Schéma flexible pour multiplierIdSchema
export const multiplierIdSchema = z.union([
  z.number().positive(),
  z.string().transform((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) throw new Error("ID multiplicateur invalide");
    return parsed;
  }),
]);

// ✅ Validateur de coordonnées spécifique au Sénégal
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
