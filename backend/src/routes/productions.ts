// backend/src/routes/productions.ts - VERSION NETTOYÉE

import { Router } from "express";
import { ProductionController } from "../controllers/ProductionController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { z } from "zod";
import {
  ActivityTypeEnum,
  IssueTypeEnum,
  IssueSeverityEnum,
} from "../validators/common";

const router = Router();

const createProductionSchema = z.object({
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
  notes: z.string().optional(),
  weatherConditions: z.string().optional(),
});

const updateProductionSchema = createProductionSchema.partial().omit({
  lotId: true,
  multiplierId: true,
  parcelId: true,
});

const activitySchema = z.object({
  type: ActivityTypeEnum, // Enum Prisma direct
  activityDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  description: z.string().min(1),
  personnel: z.array(z.string()).optional(),
  notes: z.string().optional(),
  inputs: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.string(),
        unit: z.string(),
        cost: z.number().optional(),
      })
    )
    .optional(),
});

const issueSchema = z.object({
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  type: IssueTypeEnum, // Enum Prisma direct
  description: z.string().min(1),
  severity: IssueSeverityEnum, // Enum Prisma direct
  actions: z.string().min(1),
  cost: z.number().optional(),
});

const weatherDataSchema = z.object({
  recordDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  temperature: z.number(),
  rainfall: z.number(),
  humidity: z.number(),
  windSpeed: z.number().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

// Routes
router.get("/", ProductionController.getProductions);
router.get("/:id", ProductionController.getProductionById);

router.post(
  "/",
  authMiddleware,
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: createProductionSchema }),
  ProductionController.createProduction
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: updateProductionSchema }),
  ProductionController.updateProduction
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  ProductionController.deleteProduction
);

router.post(
  "/:id/activities",
  authMiddleware,
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: activitySchema }),
  ProductionController.addActivity
);

router.post(
  "/:id/issues",
  authMiddleware,
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: issueSchema }),
  ProductionController.addIssue
);

router.post(
  "/:id/weather-data",
  authMiddleware,
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: weatherDataSchema }),
  ProductionController.addWeatherData
);

export default router;
