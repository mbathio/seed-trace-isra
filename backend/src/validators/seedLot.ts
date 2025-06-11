// backend/src/validators/seedLot.ts - ✅ CORRIGÉ
import { z } from "zod";
import {
  SeedLevelEnum,
  LotStatusEnum,
  varietyIdSchema,
  multiplierIdSchema,
  positiveIntSchema,
  paginationSchema,
  notesSchema,
  positiveIdSchema,
} from "./common";

// ✅ CORRECTION: Validateur pour la création de lots (sans .omit() problématique)
export const createSeedLotSchema = z.object({
  varietyId: varietyIdSchema,
  level: SeedLevelEnum,
  quantity: z
    .number()
    .positive("Quantité doit être positive")
    .min(1, "Quantité minimum 1kg")
    .max(1000000, "Quantité maximum 1,000,000kg"),
  productionDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date de production invalide")
    .refine((date) => {
      const prodDate = new Date(date);
      const now = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      return prodDate <= now && prodDate >= twoYearsAgo;
    }, "Date de production doit être dans les 2 dernières années et pas dans le futur"),
  expiryDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return !isNaN(Date.parse(date));
    }, "Date d'expiration invalide"),
  multiplierId: multiplierIdSchema.optional(),
  parcelId: positiveIdSchema.optional(),
  parentLotId: z.string().min(1).optional(),
  batchNumber: z
    .string()
    .max(50, "Numéro de lot ne peut pas dépasser 50 caractères")
    .optional(),
  notes: notesSchema,
  status: LotStatusEnum.optional(),
});

// ✅ CORRECTION: Validateur pour la mise à jour (schéma indépendant)
export const updateSeedLotSchema = z.object({
  quantity: z
    .number()
    .positive("Quantité doit être positive")
    .min(0, "Quantité ne peut pas être négative")
    .optional(),
  status: LotStatusEnum.optional(),
  expiryDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return !isNaN(Date.parse(date));
    }, "Date d'expiration invalide"),
  batchNumber: z
    .string()
    .max(50, "Numéro de lot ne peut pas dépasser 50 caractères")
    .optional(),
  notes: notesSchema,
});

// ✅ CORRECTION: Validateur pour les requêtes de recherche
export const seedLotQuerySchema = paginationSchema.extend({
  level: SeedLevelEnum.optional(),
  status: LotStatusEnum.optional(),
  varietyId: varietyIdSchema.optional(),
  multiplierId: multiplierIdSchema.optional(),
  parcelId: positiveIdSchema.optional(),
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
    .optional(),
});

// ✅ CORRECTION: Validateur pour le transfert de lots
export const transferSeedLotSchema = z
  .object({
    sourceId: z.string().min(1, "ID du lot source requis"),
    targetMultiplierId: multiplierIdSchema,
    quantity: z
      .number()
      .positive("Quantité à transférer doit être positive")
      .min(1, "Quantité minimum 1kg"),
    notes: z
      .string()
      .max(500, "Notes de transfert ne peuvent pas dépasser 500 caractères")
      .optional(),
  })
  .refine((data) => data.quantity > 0, {
    message: "Quantité à transférer doit être positive",
    path: ["quantity"],
  });

// ✅ CORRECTION: Validateur pour les requêtes de généalogie
export const genealogyQuerySchema = z.object({
  includeAncestors: z.boolean().optional().default(true),
  includeDescendants: z.boolean().optional().default(true),
  maxDepth: z
    .number()
    .int("Profondeur doit être un entier")
    .min(1, "Profondeur minimum 1")
    .max(10, "Profondeur maximum 10")
    .optional()
    .default(5),
});

// ✅ CORRECTION: Validateur pour les filtres avancés
export const advancedSeedLotFiltersSchema = z.object({
  varieties: z.array(varietyIdSchema).optional(),
  multipliers: z.array(multiplierIdSchema).optional(),
  levels: z.array(SeedLevelEnum).optional(),
  statuses: z.array(LotStatusEnum).optional(),
  quantityMin: z.number().positive().optional(),
  quantityMax: z.number().positive().optional(),
  productionDateStart: z.string().optional(),
  productionDateEnd: z.string().optional(),
  hasParent: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  qualityStatus: z.enum(["PASS", "FAIL", "PENDING", "ANY"]).optional(),
});

// ✅ CORRECTION: Validateur pour l'import en masse
export const bulkImportSeedLotSchema = z.array(
  createSeedLotSchema.omit({ parentLotId: true }).extend({
    // Champs supplémentaires pour l'import
    varietyCode: z.string().optional(),
    multiplierName: z.string().optional(),
    parcelName: z.string().optional(),
  })
);

// ✅ CORRECTION: Validateur pour la génération de QR codes
export const qrCodeGenerationSchema = z.object({
  lotIds: z.array(z.string().min(1)).min(1, "Au moins un lot requis"),
  format: z.enum(["PNG", "SVG", "PDF"]).optional().default("PNG"),
  size: z.enum(["small", "medium", "large"]).optional().default("medium"),
  includeData: z.boolean().optional().default(true),
});

// ✅ CORRECTION: Validateur pour les alertes d'expiration
export const expirationAlertSchema = z.object({
  daysAhead: z
    .number()
    .int("Nombre de jours doit être un entier")
    .min(1, "Minimum 1 jour")
    .max(365, "Maximum 365 jours")
    .default(30),
  includeStatuses: z.array(LotStatusEnum).optional(),
  excludeStatuses: z.array(LotStatusEnum).optional(),
});
