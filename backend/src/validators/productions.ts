// backend/src/validators/productions.ts - VERSION UNIFIÉE
import { z } from "zod";
import {
  ProductionStatusEnum,
  ActivityTypeEnum,
  IssueTypeEnum,
  IssueSeverityEnum,
} from "./common";

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
  status: ProductionStatusEnum.optional().default("PLANNED"),
  notes: z.string().max(1000).optional(),
  weatherConditions: z.string().max(500).optional(),
});

export const updateProductionSchema = createProductionSchema
  .partial()
  .omit({ lotId: true, multiplierId: true, parcelId: true });

export const addActivitySchema = z.object({
  type: ActivityTypeEnum, // ✅ Utilise directement l'enum Prisma
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

export const addIssueSchema = z.object({
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  type: IssueTypeEnum, // ✅ Utilise directement l'enum Prisma
  description: z.string().min(1).max(1000),
  severity: IssueSeverityEnum, // ✅ Utilise directement l'enum Prisma
  actions: z.string().min(1).max(1000),
  cost: z.number().positive().optional(),
});

export const productionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: ProductionStatusEnum.optional(),
  multiplierId: z.coerce.number().positive().optional(),
  sortBy: z
    .enum(["startDate", "status", "actualYield", "createdAt"])
    .default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
