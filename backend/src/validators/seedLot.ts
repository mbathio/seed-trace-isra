import { z } from "zod";

// Schéma pour la création d'un lot
export const createSeedLotSchema = z.object({
  varietyId: z.number().positive("L'ID de la variété doit être positif"),
  level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]),
  quantity: z.number().positive("La quantité doit être positive"),
  productionDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date de production invalide",
  }),
  expiryDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Date d'expiration invalide",
    })
    .optional(),
  status: z
    .enum([
      "PENDING",
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
    ])
    .optional(),
  batchNumber: z.string().optional(),
  multiplierId: z.number().positive().optional(),
  parcelId: z.number().positive().optional(),
  parentLotId: z.string().optional(),
  notes: z.string().optional(),
});

// Schéma pour la mise à jour d'un lot
export const updateSeedLotSchema = z.object({
  quantity: z.number().positive().optional(),
  status: z
    .enum([
      "PENDING",
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
    ])
    .optional(),
  notes: z.string().optional(),
  multiplierId: z.number().positive().optional(),
  parcelId: z.number().positive().optional(),
  expiryDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Date d'expiration invalide",
    })
    .optional(),
  batchNumber: z.string().optional(),
});

// Schéma pour les paramètres de requête
export const seedLotQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  pageSize: z.coerce.number().positive().max(100).optional(),
  search: z.string().optional(),
  level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]).optional(),
  status: z
    .enum([
      "PENDING",
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
    ])
    .optional(),
  varietyId: z.coerce.number().positive().optional(),
  multiplierId: z.coerce.number().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  includeRelations: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

// Schéma pour la création d'un lot enfant
export const createChildLotSchema = z.object({
  varietyId: z.number().positive(),
  quantity: z.number().positive(),
  productionDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  multiplierId: z.number().positive().optional(),
  parcelId: z.number().positive().optional(),
  notes: z.string().optional(),
  batchNumber: z.string().optional(),
});

// Schéma pour le transfert d'un lot
export const transferLotSchema = z.object({
  targetMultiplierId: z.number().positive(),
  quantity: z.number().positive(),
  notes: z.string().optional(),
});
