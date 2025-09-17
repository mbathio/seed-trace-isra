// backend/src/validators/seedLot.ts - VERSION CORRIGÉE AVEC DEBUG

import { z } from "zod";

// Schémas de base réutilisables
const positiveIntSchema = z.number().int().positive();
const notesSchema = z.string().max(1000).optional();

// ✅ CORRECTION CRITIQUE: Enums avec valeurs UI exactes
const SeedLevelEnum = z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"], {
  errorMap: (issue, _ctx) => {
    if (issue.code === "invalid_enum_value") {
      return {
        message: `Niveau de semence invalide "${issue.received}". Valeurs acceptées: GO, G1, G2, G3, G4, R1, R2`,
      };
    }
    return { message: "Niveau de semence invalide" };
  },
});

// ✅ CORRECTION CRITIQUE: Status avec valeurs UI exactes (kebab-case)
const LotStatusEnum = z.enum(
  [
    "pending",
    "certified",
    "rejected",
    "in-stock", // ✅ CRITIQUE: kebab-case - c'est ça qui posait problème !
    "sold",
    "active",
    "distributed",
  ],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Statut de lot invalide "${issue.received}". Valeurs acceptées: pending, certified, rejected, in-stock, sold, active, distributed`,
        };
      }
      return { message: "Statut de lot invalide" };
    },
  }
);

// Schéma de pagination avec transformation plus robuste
const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) || num < 1 ? 1 : num;
      }
      return val < 1 ? 1 : val;
    })
    .optional()
    .default(1),
  pageSize: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const num = parseInt(val, 10);
        return isNaN(num) || num < 1 ? 10 : Math.min(num, 100);
      }
      return val < 1 ? 10 : Math.min(val, 100);
    })
    .optional()
    .default(10),
});

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

// ✅ CORRECTION CRITIQUE: Schéma de requête avec validation très permissive
export const seedLotQuerySchema = paginationSchema.extend({
  level: SeedLevelEnum.optional(),
  status: LotStatusEnum.optional(), // ✅ CORRECTION: Utilise le bon enum
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

// ✅ AJOUT: Schéma de requête ultra-permissif pour debugging
export const debugSeedLotQuerySchema = z
  .object({
    page: z.union([z.string(), z.number()]).optional().default(1),
    pageSize: z.union([z.string(), z.number()]).optional().default(10),
    level: z.string().optional(),
    status: z.string().optional(), // ✅ Accepte n'importe quelle string
    varietyId: z.union([z.string(), z.number()]).optional(),
    multiplierId: z.union([z.string(), z.number()]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    includeRelations: z
      .union([z.boolean(), z.string()])
      .optional()
      .default(true),
    includeExpired: z
      .union([z.boolean(), z.string()])
      .optional()
      .default(false),
    search: z.string().optional(),
    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .passthrough(); // ✅ Permet tous les champs supplémentaires

// Schéma pour création de lot enfant
export const createChildLotSchema = z.object({
  quantity: z.number().positive("La quantité doit être positive"),
  productionDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date invalide"),
  level: SeedLevelEnum,
  multiplierId: positiveIntSchema.optional(),
  parcelId: positiveIntSchema.optional(),
  notes: notesSchema,
  batchNumber: z.string().max(50).optional(),
});

// Schéma pour transfert
export const transferLotSchema = z.object({
  targetMultiplierId: positiveIntSchema,
  quantity: z.number().positive("La quantité doit être positive"),
  notes: notesSchema,
});

// Schéma pour mise à jour en masse
export const bulkUpdateSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "Au moins un ID requis")
    .max(100, "Maximum 100 lots à la fois"),
  updateData: updateSeedLotSchema,
});

// Export des types TypeScript
export type CreateSeedLotInput = z.infer<typeof createSeedLotSchema>;
export type UpdateSeedLotInput = z.infer<typeof updateSeedLotSchema>;
export type SeedLotQueryInput = z.infer<typeof seedLotQuerySchema>;
export type CreateChildLotInput = z.infer<typeof createChildLotSchema>;
export type TransferLotInput = z.infer<typeof transferLotSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type DebugSeedLotQueryInput = z.infer<typeof debugSeedLotQuerySchema>;

// ✅ AJOUT: Helper pour déboguer les erreurs de validation
export const validateSeedLotQuery = (data: unknown) => {
  console.log(
    "🔍 [DEBUG] Validating seed lot query:",
    JSON.stringify(data, null, 2)
  );

  const result = seedLotQuerySchema.safeParse(data);

  if (!result.success) {
    console.error("❌ [DEBUG] Validation failed:", result.error.issues);

    // Essayer avec le schéma de debug
    const debugResult = debugSeedLotQuerySchema.safeParse(data);
    if (debugResult.success) {
      console.log(
        "✅ [DEBUG] Debug schema validation passed:",
        debugResult.data
      );
    }
  } else {
    console.log("✅ [DEBUG] Validation passed:", result.data);
  }

  return result;
};
