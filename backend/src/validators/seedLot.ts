// backend/src/validators/seedLot.ts
import { z } from "zod";

export const createSeedLotSchema = z.object({
  varietyId: z.union([z.number().positive(), z.string()]),
  level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]),
  quantity: z.number().positive("La quantité doit être positive"),
  productionDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
  multiplierId: z.number().positive().optional(),
  parcelId: z.number().positive().optional(),
  parentLotId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSeedLotSchema = z.object({
  quantity: z.number().positive().optional(),
  status: z
    .enum([
      "pending",
      "certified",
      "rejected",
      "in-stock",
      "sold",
      "active",
      "distributed",
    ])
    .transform((status) => status.toUpperCase().replace("-", "_"))
    .optional(),
  notes: z.string().optional(),
  expiryDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
    .optional(),
});

export const seedLotQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .refine((n) => n > 0)
    .optional(),
  pageSize: z
    .string()
    .transform(Number)
    .refine((n) => n > 0 && n <= 100)
    .optional(),
  search: z.string().optional(),
  level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]).optional(), // ✅ MAJUSCULES
  status: z
    .enum([
      "PENDING", // ✅ MAJUSCULES
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
    ])
    .optional(),
  varietyId: z.union([z.string(), z.number()]).optional(), // ✅ Accepte les deux types
  multiplierId: z.string().transform(Number).optional(),
  sortBy: z.enum(["productionDate", "quantity", "level", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
