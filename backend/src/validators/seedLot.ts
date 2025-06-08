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
      "PENDING", // ✅ CORRECTION: Valeurs DB directes
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
    ])
    .optional(),
  notes: z.string().optional(),
  expiryDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
    .optional(),
});

export const seedLotQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => parseInt(val.toString()))
    .refine((n) => n > 0, "Page doit être positive")
    .optional(),
  pageSize: z
    .union([z.string(), z.number()])
    .transform((val) => Math.min(parseInt(val.toString()), 100))
    .refine((n) => n > 0 && n <= 100, "PageSize doit être entre 1 et 100")
    .optional(),
  search: z.string().optional(),
  level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]).optional(),
  status: z
    .enum([
      "PENDING", // ✅ CORRECTION: Valeurs DB directes
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
    ])
    .optional(),
  varietyId: z.union([z.string(), z.number()]).optional(),
  multiplierId: z
    .union([z.string(), z.number()])
    .transform((val) => parseInt(val.toString()))
    .optional(),
  sortBy: z.enum(["productionDate", "quantity", "level", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
