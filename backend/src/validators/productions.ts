// backend/src/validators/productions.ts - VERSION UNIFIÉE
import { z } from "zod";
import {
  ProductionStatus,
  ActivityType,
  IssueType,
  IssueSeverity,
} from "@prisma/client";

// 🔹 Schéma de création de production
export const createProductionSchema = z.object({
  lotId: z.string().min(1),
  multiplierId: z.number().positive(),
  parcelId: z.number().positive(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)))
    .optional(),
  sowingDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)))
    .optional(),
  harvestDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)))
    .optional(),
  plannedQuantity: z.number().positive().optional(),
  actualYield: z.number().positive().optional(),
  status: z
    .nativeEnum(ProductionStatus)
    .optional()
    .default(ProductionStatus.planned),
  notes: z.string().max(1000).optional(),
  weatherConditions: z.string().max(500).optional(),
});

// 🔹 Schéma de mise à jour
export const updateProductionSchema = createProductionSchema
  .partial()
  .omit({ lotId: true, multiplierId: true, parcelId: true });

// 🔹 Schéma ajout d'activité
export const addActivitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  activityDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  description: z.string().min(1).max(1000),
  personnel: z.array(z.string()).optional().default([]),
  notes: z.string().max(1000).optional(),
  inputs: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.string(),
        unit: z.string(),
        cost: z.number().positive().optional(),
      })
    )
    .optional()
    .default([]),
});

// 🔹 Schéma ajout d'incident / problème
export const addIssueSchema = z.object({
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  type: z.nativeEnum(IssueType),
  description: z.string().min(1).max(1000),
  severity: z.nativeEnum(IssueSeverity),
  actions: z.string().min(1).max(1000),
  cost: z.number().positive().optional(),
});

// 🔹 Schéma de requête pour lister les productions
export const productionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(ProductionStatus).optional(),
  multiplierId: z.coerce.number().positive().optional(),
  sortBy: z
    .enum(["startDate", "status", "actualYield", "createdAt"])
    .default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// 🔹 Types TypeScript
export type CreateProductionInput = z.infer<typeof createProductionSchema>;
export type UpdateProductionInput = z.infer<typeof updateProductionSchema>;
export type AddActivityInput = z.infer<typeof addActivitySchema>;
export type AddIssueInput = z.infer<typeof addIssueSchema>;
export type ProductionQueryInput = z.infer<typeof productionQuerySchema>;
