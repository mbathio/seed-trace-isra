// backend/src/validators/seedLotQuery.ts
import { z } from "zod";

// Schéma de requête flexible qui accepte les paramètres comme strings ou nombres
export const seedLotQuerySchema = z
  .object({
    // Pagination
    page: z.union([z.string(), z.number()]).optional(),
    pageSize: z.union([z.string(), z.number()]).optional(),

    // Recherche
    search: z.string().optional(),

    // Filtres
    level: z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]).optional(),
    status: z
      .enum([
        // Format UI (kebab-case)
        "pending",
        "certified",
        "rejected",
        "in-stock",
        "sold",
        "active",
        "distributed",
        // Format DB (SNAKE_CASE)
        "PENDING",
        "CERTIFIED",
        "REJECTED",
        "IN_STOCK",
        "SOLD",
        "ACTIVE",
        "DISTRIBUTED",
      ])
      .optional(),

    // IDs (peuvent être strings ou nombres)
    varietyId: z.union([z.string(), z.number()]).optional(),
    multiplierId: z.union([z.string(), z.number()]).optional(),
    parcelId: z.union([z.string(), z.number()]).optional(),

    // Dates
    startDate: z.string().optional(),
    endDate: z.string().optional(),

    // Tri
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),

    // Booléens (peuvent être strings ou booléens)
    includeRelations: z
      .union([z.boolean(), z.literal("true"), z.literal("false"), z.string()])
      .optional(),
    includeExpired: z
      .union([z.boolean(), z.literal("true"), z.literal("false"), z.string()])
      .optional(),
    includeInactive: z
      .union([z.boolean(), z.literal("true"), z.literal("false"), z.string()])
      .optional(),
  })
  .passthrough(); // Permet les paramètres additionnels

export type SeedLotQueryInput = z.infer<typeof seedLotQuerySchema>;
