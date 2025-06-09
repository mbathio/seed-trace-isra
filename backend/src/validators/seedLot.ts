// backend/src/validators/seedLot.ts - Validateurs de lots de semences corrigés
import { z } from "zod";
import {
  SeedLevelEnum,
  LotStatusEnum,
  varietyIdSchema,
  multiplierIdSchema,
  positiveIntSchema,
  dateSchema,
  optionalDateSchema,
  paginationSchema,
} from "./common";

export const createSeedLotSchema = z
  .object({
    varietyId: varietyIdSchema,
    level: SeedLevelEnum,
    quantity: positiveIntSchema.refine(
      (qty) => qty >= 10 && qty <= 1000000,
      "Quantité doit être entre 10kg et 1,000,000kg"
    ),
    productionDate: dateSchema.refine((date) => {
      const now = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      return date <= now && date >= twoYearsAgo;
    }, "Date de production doit être dans les 2 dernières années et pas dans le futur"),
    expiryDate: optionalDateSchema,
    multiplierId: multiplierIdSchema.optional(),
    parcelId: z.number().positive().optional(),
    parentLotId: z.string().optional(),
    batchNumber: z
      .string()
      .max(50, "Numéro de lot ne peut pas dépasser 50 caractères")
      .optional(),
    notes: z
      .string()
      .max(1000, "Notes ne peuvent pas dépasser 1000 caractères")
      .optional(),
    status: LotStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.expiryDate && data.productionDate) {
        return data.expiryDate > data.productionDate;
      }
      return true;
    },
    {
      message:
        "Date d'expiration doit être postérieure à la date de production",
      path: ["expiryDate"],
    }
  )
  .refine(
    (data) => {
      // Validation des quantités selon le niveau
      const levelLimits: Record<string, { min: number; max: number }> = {
        GO: { min: 10, max: 1000 },
        G1: { min: 100, max: 5000 },
        G2: { min: 500, max: 10000 },
        G3: { min: 1000, max: 20000 },
        G4: { min: 2000, max: 50000 },
        R1: { min: 5000, max: 100000 },
        R2: { min: 10000, max: 500000 },
      };

      const limits = levelLimits[data.level];
      if (limits) {
        return data.quantity >= limits.min && data.quantity <= limits.max;
      }
      return true;
    },
    {
      message: "Quantité non appropriée pour ce niveau de semence",
      path: ["quantity"],
    }
  );

export const updateSeedLotSchema = z
  .object({
    quantity: positiveIntSchema.optional(),
    status: LotStatusEnum.optional(),
    expiryDate: optionalDateSchema,
    batchNumber: z
      .string()
      .max(50, "Numéro de lot ne peut pas dépasser 50 caractères")
      .optional(),
    notes: z
      .string()
      .max(1000, "Notes ne peuvent pas dépasser 1000 caractères")
      .optional(),
  })
  .refine(
    (data) => {
      // Si quantity et status sont fournis, valider la cohérence
      if (data.quantity !== undefined && data.status) {
        if (
          data.quantity === 0 &&
          !["SOLD", "DISTRIBUTED"].includes(data.status)
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Quantité zéro n'est autorisée que pour les statuts SOLD ou DISTRIBUTED",
      path: ["quantity"],
    }
  );

export const seedLotQuerySchema = paginationSchema.extend({
  level: SeedLevelEnum.optional(),
  status: LotStatusEnum.optional(),
  varietyId: varietyIdSchema.optional(),
  multiplierId: multiplierIdSchema.optional(),
  parcelId: z
    .union([z.string(), z.number()])
    .transform((val) => parseInt(val.toString()))
    .refine((n) => !isNaN(n) && n > 0, "ID parcelle invalide")
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  expiringInDays: z
    .union([z.string(), z.number()])
    .transform((val) => parseInt(val.toString()))
    .refine(
      (n) => !isNaN(n) && n >= 0 && n <= 365,
      "Nombre de jours doit être entre 0 et 365"
    )
    .optional(),
  hasQualityControl: z
    .union([z.string(), z.boolean()])
    .transform((val) => val === "true" || val === true)
    .optional(),
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

export const transferSeedLotSchema = z
  .object({
    sourceId: z.string().min(1, "ID du lot source requis"),
    targetMultiplierId: multiplierIdSchema,
    quantity: positiveIntSchema,
    notes: z
      .string()
      .max(500, "Notes de transfert ne peuvent pas dépasser 500 caractères")
      .optional(),
  })
  .refine((data) => data.quantity > 0, {
    message: "Quantité à transférer doit être positive",
    path: ["quantity"],
  });

export const genealogyQuerySchema = z.object({
  includeAncestors: z.boolean().optional().default(true),
  includeDescendants: z.boolean().optional().default(true),
  maxDepth: z.number().int().min(1).max(10).optional().default(5),
});
