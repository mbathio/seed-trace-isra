// backend/src/validators/seedLot.ts - VALIDATEURS CORRIGÉS
import { z } from "zod";

// Validation des niveaux de semences
const SeedLevelEnum = z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]);

// Validation des statuts de lots (valeurs DB)
const LotStatusEnum = z.enum([
  "PENDING",
  "CERTIFIED",
  "REJECTED",
  "IN_STOCK",
  "SOLD",
  "ACTIVE",
  "DISTRIBUTED",
]);

// Validation du varietyId flexible (peut être un nombre ou un string)
const varietyIdSchema = z.union([
  z.number().positive(),
  z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, "Code variété invalide"),
]);

// Validation des notes
const notesSchema = z
  .string()
  .max(1000, "Notes ne peuvent pas dépasser 1000 caractères")
  .optional()
  .transform((notes) => notes?.trim() || undefined);

// Validation des dates
const dateStringSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
  .transform((date) => new Date(date).toISOString());

// Validation des quantités
const quantitySchema = z
  .number()
  .positive("Quantité doit être positive")
  .min(1, "Quantité minimum 1kg")
  .max(1000000, "Quantité maximum 1,000,000kg");

// Schéma de création de lot de semences
export const createSeedLotSchema = z
  .object({
    varietyId: varietyIdSchema,
    level: SeedLevelEnum,
    quantity: quantitySchema,
    productionDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Date de production invalide")
      .refine((date) => {
        const prodDate = new Date(date);
        const now = new Date();
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return prodDate <= now && prodDate >= twoYearsAgo;
      }, "Date doit être dans les 2 dernières années"),
    expiryDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        "Date d'expiration invalide"
      ),
    multiplierId: z.number().positive().optional(),
    parcelId: z.number().positive().optional(),
    parentLotId: z.string().min(1).optional(),
    batchNumber: z
      .string()
      .max(50, "Numéro de lot trop long")
      .optional()
      .transform((val) => val?.trim() || undefined),
    notes: notesSchema,
    status: LotStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.expiryDate && data.productionDate) {
        return new Date(data.expiryDate) > new Date(data.productionDate);
      }
      return true;
    },
    {
      message: "Date d'expiration doit être après la production",
      path: ["expiryDate"],
    }
  );

// Schéma de mise à jour de lot de semences
export const updateSeedLotSchema = z.object({
  quantity: quantitySchema.optional(),
  status: LotStatusEnum.optional(),
  expiryDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      "Date d'expiration invalide"
    ),
  batchNumber: z
    .string()
    .max(50, "Numéro de lot trop long")
    .optional()
    .transform((val) => val?.trim() || undefined),
  notes: notesSchema,
});

// Schéma de requête/filtres pour les lots de semences
export const seedLotQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return Math.max(1, isNaN(num) ? 1 : num);
    })
    .optional(),
  pageSize: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return Math.min(Math.max(1, isNaN(num) ? 10 : num), 100);
    })
    .optional(),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  level: SeedLevelEnum.optional(),
  status: LotStatusEnum.optional(),
  varietyId: varietyIdSchema.optional(),
  multiplierId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num <= 0 ? undefined : num;
    })
    .optional(),
  parcelId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) || num <= 0 ? undefined : num;
    })
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .enum([
      "productionDate",
      "quantity",
      "level",
      "status",
      "varietyName",
      "multiplierName",
      "expiryDate",
      "createdAt",
    ])
    .optional()
    .default("productionDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Schéma de validation pour la hiérarchie des lots
export const lotHierarchySchema = z
  .object({
    parentLotId: z.string().min(1),
    childLevel: SeedLevelEnum,
  })
  .refine(
    async (data) => {
      // Cette validation nécessiterait une requête DB pour vérifier le niveau parent
      // Pour l'instant, on fait une validation basique
      const hierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
      return hierarchy.includes(data.childLevel);
    },
    {
      message: "Hiérarchie de lots invalide",
    }
  );

// Types pour TypeScript
export type CreateSeedLotInput = z.infer<typeof createSeedLotSchema>;
export type UpdateSeedLotInput = z.infer<typeof updateSeedLotSchema>;
export type SeedLotQueryInput = z.infer<typeof seedLotQuerySchema>;
export type LotHierarchyInput = z.infer<typeof lotHierarchySchema>;
