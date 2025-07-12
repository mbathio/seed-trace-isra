// backend/src/validators/seedLot.ts

import { z } from "zod";
import {
  SeedLevelEnum,
  LotStatusEnum,
  positiveIntSchema,
  notesSchema,
  paginationSchema,
} from "./common";

// Schéma de création avec validation métier
export const createSeedLotSchema = z
  .object({
    varietyId: positiveIntSchema,
    level: SeedLevelEnum,
    quantity: z
      .number()
      .positive("La quantité doit être positive")
      .min(1, "Quantité minimum 1 kg")
      .max(1000000, "Quantité maximum 1,000,000 kg"),
    productionDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Date de production invalide")
      .refine(
        (date) => new Date(date) <= new Date(),
        "La date de production ne peut pas être dans le futur"
      ),
    expiryDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || !isNaN(Date.parse(date)),
        "Date d'expiration invalide"
      ),
    status: LotStatusEnum.optional().default("pending"),
    batchNumber: z.string().max(50).optional(),
    multiplierId: positiveIntSchema.optional(),
    parcelId: positiveIntSchema.optional(),
    parentLotId: z.string().optional(),
    notes: notesSchema,
  })
  .refine(
    (data) => {
      // Validation: la date d'expiration doit être après la date de production
      if (data.expiryDate && data.productionDate) {
        return new Date(data.expiryDate) > new Date(data.productionDate);
      }
      return true;
    },
    {
      message: "La date d'expiration doit être après la date de production",
      path: ["expiryDate"],
    }
  );

// Schéma de mise à jour
export const updateSeedLotSchema = z.object({
  quantity: z.number().positive().optional(),
  status: LotStatusEnum.optional(),
  notes: notesSchema,
  multiplierId: positiveIntSchema.optional().nullable(),
  parcelId: positiveIntSchema.optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  batchNumber: z.string().max(50).optional(),
});

// ✅ CORRECTION: Schéma de requête avec transformation des types
export const seedLotQuerySchema = paginationSchema.extend({
  level: SeedLevelEnum.optional(),
  status: LotStatusEnum.optional(),
  varietyId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .optional(),
  multiplierId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // ✅ CORRECTION: Gérer includeRelations comme booléen ou string
  includeRelations: z
    .union([z.boolean(), z.string().transform((val) => val === "true")])
    .optional(),
  includeExpired: z
    .union([z.boolean(), z.string().transform((val) => val === "true")])
    .optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Schéma pour création de lot enfant
export const createChildLotSchema = z.object({
  quantity: z.number().positive(),
  productionDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  multiplierId: positiveIntSchema.optional(),
  parcelId: positiveIntSchema.optional(),
  notes: notesSchema,
  batchNumber: z.string().max(50).optional(),
});

// Schéma pour transfert
export const transferLotSchema = z.object({
  targetMultiplierId: positiveIntSchema,
  quantity: z.number().positive(),
  notes: notesSchema,
});

// Schéma pour mise à jour en masse
export const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  updateData: updateSeedLotSchema,
});

// Export des types TypeScript
export type CreateSeedLotInput = z.infer<typeof createSeedLotSchema>;
export type UpdateSeedLotInput = z.infer<typeof updateSeedLotSchema>;
export type SeedLotQueryInput = z.infer<typeof seedLotQuerySchema>;
export type CreateChildLotInput = z.infer<typeof createChildLotSchema>;
export type TransferLotInput = z.infer<typeof transferLotSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
