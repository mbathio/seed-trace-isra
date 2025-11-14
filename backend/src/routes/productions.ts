// ===== 5. backend/src/routes/productions.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { ProductionController } from "../controllers/ProductionController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(fullTransformation);

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
  // ⚠️ MAINTENANT : valeurs ENUM côté DB (après transformation middleware)
  type: z.enum([
    "SOIL_PREPARATION",
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
  // ✅ On passe aux valeurs ENUM côté DB (après transformation middleware)
  type: z.enum(["DISEASE", "PEST", "WEATHER", "MANAGEMENT", "OTHER"]),
  description: z.string().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  actions: z.string().min(1),
  cost: z.number().optional(),
  // (optionnel) tu peux aussi accepter ce que tu envoies déjà côté front :
  resolved: z.boolean().optional(),
  resolvedDate: z.string().optional(),
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

// Routes...
router.get("/", ProductionController.getProductions);
router.get("/:id", ProductionController.getProductionById);
router.post(
  "/",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: createProductionSchema }),
  ProductionController.createProduction
);
router.put(
  "/:id",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: updateProductionSchema }),
  ProductionController.updateProduction
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  ProductionController.deleteProduction
);
router.post(
  "/:id/activities",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: activitySchema }),
  ProductionController.addActivity
);
router.post(
  "/:id/issues",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: issueSchema }),
  ProductionController.addIssue
);
router.post(
  "/:id/weather-data",
  requireRole("TECHNICIAN", "MANAGER", "ADMIN"),
  validateRequest({ body: weatherDataSchema }),
  ProductionController.addWeatherData
);

export default router;
