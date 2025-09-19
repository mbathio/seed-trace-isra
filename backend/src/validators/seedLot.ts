// backend/src/validators/seedLot.ts - VERSION UNIFIÉE
import { z } from "zod";
import { prisma } from "../config/database";
import { LotStatus, SeedLevel } from "@prisma/client"; // ✅ Enums Prisma directs
import { paginationSchema, positiveIntSchema, notesSchema } from "./common";

// 🔹 Schéma de création de lot
export const createSeedLotSchema = z
  .object({
    varietyId: positiveIntSchema,
    level: z.nativeEnum(SeedLevel),
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
    status: z.nativeEnum(LotStatus).optional().default(LotStatus.pending),
    batchNumber: z.string().max(50).optional(),
    multiplierId: positiveIntSchema.optional(),
    parcelId: positiveIntSchema.optional(),
    parentLotId: z.string().optional(),
    notes: notesSchema,
  })
  .refine(
    (data) => {
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

// 🔹 Schéma de mise à jour
export const updateSeedLotSchema = z.object({
  quantity: z.number().positive().optional(),
  status: z.nativeEnum(LotStatus).optional(),
  notes: notesSchema,
  multiplierId: positiveIntSchema.optional().nullable(),
  parcelId: positiveIntSchema.optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  batchNumber: z.string().max(50).optional(),
});

// 🔹 Schéma de requête
export const seedLotQuerySchema = paginationSchema.extend({
  level: z.nativeEnum(SeedLevel).optional(),
  status: z.nativeEnum(LotStatus).optional(),
  varietyId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) || num < 1 ? undefined : num;
      }
      return val < 1 ? undefined : val;
    })
    .optional(),
  multiplierId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) || num < 1 ? undefined : num;
      }
      return val < 1 ? undefined : val;
    })
    .optional(),
  startDate: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Date invalide")
    .optional(),
  endDate: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Date invalide")
    .optional(),
  includeRelations: z
    .union([
      z.boolean(),
      z.string().transform((val) => val === "true"),
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
    ])
    .optional()
    .default(true),
  includeExpired: z
    .union([
      z.boolean(),
      z.string().transform((val) => val === "true"),
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
    ])
    .optional()
    .default(false),
  search: z.string().optional(),
  sortBy: z
    .string()
    .regex(/^[a-zA-Z]+(\.[a-zA-Z]+)?$/, "Format de tri invalide")
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// 🔹 Schéma création lot enfant
export const createChildLotSchema = z.object({
  quantity: z.number().positive("La quantité doit être positive"),
  productionDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
  level: z.nativeEnum(SeedLevel),
  multiplierId: positiveIntSchema.optional(),
  parcelId: positiveIntSchema.optional(),
  notes: notesSchema,
  batchNumber: z.string().max(50).optional(),
});

// 🔹 Schéma transfert
export const transferLotSchema = z.object({
  targetMultiplierId: positiveIntSchema,
  quantity: z.number().positive("La quantité doit être positive"),
  notes: notesSchema,
});

// 🔹 Schéma mise à jour en masse
export const bulkUpdateSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "Au moins un ID requis")
    .max(100, "Maximum 100 lots à la fois"),
  updateData: updateSeedLotSchema,
});

// 🔹 Types TypeScript
export type CreateSeedLotInput = z.infer<typeof createSeedLotSchema>;
export type UpdateSeedLotInput = z.infer<typeof updateSeedLotSchema>;
export type SeedLotQueryInput = z.infer<typeof seedLotQuerySchema>;
export type CreateChildLotInput = z.infer<typeof createChildLotSchema>;
export type TransferLotInput = z.infer<typeof transferLotSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
