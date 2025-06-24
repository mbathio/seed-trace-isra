// backend/src/validators/seedLot.ts
import { z } from "zod";

/**
 * Schéma de validation pour la création d'un lot de semences
 * ✅ IMPORTANT: Accepter les valeurs UI qui seront transformées par le middleware
 */
export const createSeedLotSchema = z.object({
  varietyId: z.number().positive("L'ID de la variété doit être positif"),
  level: z.enum(["GO", "G0", "G1", "G2", "G3", "G4", "R1", "R2"], {
    errorMap: () => ({ message: "Niveau de semence invalide" }),
  }),
  quantity: z
    .number()
    .positive("La quantité doit être positive")
    .min(1, "La quantité minimum est de 1 kg"),
  productionDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date de production invalide",
  }),
  status: z
    .enum([
      // Valeurs DB
      "PENDING",
      "CERTIFIED",
      "REJECTED",
      "IN_STOCK",
      "SOLD",
      "ACTIVE",
      "DISTRIBUTED",
      // Valeurs UI (seront transformées par le middleware)
      "pending",
      "certified",
      "rejected",
      "in-stock",
      "sold",
      "active",
      "distributed",
    ])
    .optional()
    .transform((val) => {
      // Transformer en majuscules si nécessaire
      if (val && val === val.toLowerCase()) {
        return val.toUpperCase().replace(/-/g, "_");
      }
      return val;
    }),
  multiplierId: z.number().positive().optional(),
  parcelId: z.number().positive().optional(),
  parentLotId: z.string().optional(),
  notes: z
    .string()
    .max(1000, "Les notes ne doivent pas dépasser 1000 caractères")
    .optional(),
  batchNumber: z.string().optional(),
  expiryDate: z
    .string()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: "Date d'expiration invalide",
    })
    .optional(),
});

/**
 * Schéma de validation pour la mise à jour d'un lot de semences
 */
export const updateSeedLotSchema = z.object({
  quantity: z
    .number()
    .positive("La quantité doit être positive")
    .min(0, "La quantité ne peut pas être négative")
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
  notes: z
    .string()
    .max(1000, "Les notes ne doivent pas dépasser 1000 caractères")
    .optional(),
  multiplierId: z.number().positive().optional(),
  parcelId: z.number().positive().optional(),
  expiryDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Date d'expiration invalide",
    })
    .optional(),
});

/**
 * Schéma de validation pour les paramètres de requête
 */
export const seedLotQuerySchema = z.object({
  page: z.coerce.number().positive().default(1).optional(),
  pageSize: z.coerce.number().positive().max(100).default(10).optional(),
  search: z.string().optional(),
  level: z.enum(["GO", "G0", "G1", "G2", "G3", "G4", "R1", "R2"]).optional(),
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
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Schéma de validation pour le transfert de lot
 */
export const transferLotSchema = z.object({
  targetMultiplierId: z
    .number()
    .positive("L'ID du multiplicateur cible doit être positif"),
  quantity: z
    .number()
    .positive("La quantité doit être positive")
    .min(1, "La quantité minimum est de 1 kg"),
  notes: z
    .string()
    .max(500, "Les notes ne doivent pas dépasser 500 caractères")
    .optional(),
});

/**
 * Schéma de validation pour la création d'un lot enfant
 */
export const createChildLotSchema = z.object({
  varietyId: z.number().positive("L'ID de la variété doit être positif"),
  quantity: z
    .number()
    .positive("La quantité doit être positive")
    .min(1, "La quantité minimum est de 1 kg"),
  productionDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date de production invalide",
  }),
  multiplierId: z.number().positive().optional(),
  parcelId: z.number().positive().optional(),
  notes: z
    .string()
    .max(1000, "Les notes ne doivent pas dépasser 1000 caractères")
    .optional(),
});

/**
 * Type inféré pour la création d'un lot
 */
export type CreateSeedLotInput = z.infer<typeof createSeedLotSchema>;

/**
 * Type inféré pour la mise à jour d'un lot
 */
export type UpdateSeedLotInput = z.infer<typeof updateSeedLotSchema>;

/**
 * Type inféré pour les paramètres de requête
 */
export type SeedLotQueryInput = z.infer<typeof seedLotQuerySchema>;

/**
 * Type inféré pour le transfert de lot
 */
export type TransferLotInput = z.infer<typeof transferLotSchema>;

/**
 * Type inféré pour la création d'un lot enfant
 */
export type CreateChildLotInput = z.infer<typeof createChildLotSchema>;
