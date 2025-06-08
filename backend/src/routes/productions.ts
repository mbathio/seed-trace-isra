// backend/src/routes/productions.ts - Version corrigée

import { Router } from "express";
import { ProductionController } from "../controllers/ProductionController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { z } from "zod";

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
  type: z.enum([
    "SOIL_PREPARATION", // ✅ Majuscules cohérentes
    "SOWING",
    "FERTILIZATION",
    "IRRIGATION",
    "WEEDING",
    "PEST_CONTROL",
    "HARVEST",
    "OTHER",
  ]),
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
  type: z.enum(["DISEASE", "PEST", "WEATHER", "MANAGEMENT", "OTHER"]), // ✅ Majuscules
  description: z.string().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]), // ✅ Majuscules
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

// GET /api/productions
router.get("/", ProductionController.getProductions);

// GET /api/productions/:id
router.get("/:id", ProductionController.getProductionById);

// POST /api/productions
router.post(
  "/",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"), // ✅ Majuscules
  validateRequest({ body: createProductionSchema }),
  ProductionController.createProduction
);

// PUT /api/productions/:id
router.put(
  "/:id",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: updateProductionSchema }),
  ProductionController.updateProduction
);

// DELETE /api/productions/:id
router.delete(
  "/:id",
  requireRole("ADMIN"),
  ProductionController.deleteProduction
);

// POST /api/productions/:id/activities
router.post(
  "/:id/activities",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: activitySchema }),
  ProductionController.addActivity
);

// POST /api/productions/:id/issues
router.post(
  "/:id/issues",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: issueSchema }),
  ProductionController.addIssue
);

// POST /api/productions/:id/weather-data
router.post(
  "/:id/weather-data",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: weatherDataSchema }),
  ProductionController.addWeatherData
);

export default router;
