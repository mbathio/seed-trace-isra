// backend/src/validators/seedLot.ts - CORRIGÉ
import { z } from "zod";
import {
  SeedLevelEnum,
  LotStatusEnum,
  varietyIdSchema,
  multiplierIdSchema,
  paginationSchema,
  notesSchema,
  positiveIdSchema,
} from "./common";

// Validation hiérarchie des lots
const validateLotHierarchy = (
  parentLevel: string,
  childLevel: string
): boolean => {
  const hierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
  const parentIndex = hierarchy.indexOf(parentLevel);
  const childIndex = hierarchy.indexOf(childLevel);
  return parentIndex !== -1 && childIndex !== -1 && parentIndex < childIndex;
};

// Schéma de création
export const createSeedLotSchema = z
  .object({
    varietyId: varietyIdSchema,
    level: SeedLevelEnum,
    quantity: z
      .number()
      .positive("Quantité doit être positive")
      .min(1, "Quantité minimum 1kg")
      .max(1000000, "Quantité maximum 1,000,000kg"),
    productionDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
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
      .refine((date) => !date || !isNaN(Date.parse(date)), "Date invalide"),
    multiplierId: multiplierIdSchema.optional(),
    parcelId: positiveIdSchema.optional(),
    parentLotId: z.string().min(1).optional(),
    batchNumber: z.string().max(50).optional(),
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

// Schéma de mise à jour
export const updateSeedLotSchema = z.object({
  quantity: z.number().positive().optional(),
  status: LotStatusEnum.optional(),
  expiryDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Date invalide"),
  batchNumber: z.string().max(50).optional(),
  notes: notesSchema,
});

// Schéma de requête
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
