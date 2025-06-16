import { Router } from "express";
import { ProductionController } from "../controllers/ProductionController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { productionTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(productionTransformation);

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
    "soil-preparation", // ✅ VALEURS UI (kebab-case)
    "sowing",
    "fertilization",
    "irrigation",
    "weeding",
    "pest-control",
    "harvest",
    "other",
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
  type: z.enum(["disease", "pest", "weather", "management", "other"]), // ✅ VALEURS UI
  description: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]), // ✅ VALEURS UI
  actions: z.string().min(1),
  cost: z.number().optional(),
});

// ✅ SCHÉMA COMPLET pour weatherData
const weatherDataSchema = z.object({
  recordDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  temperature: z.number(),
  rainfall: z.number(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  soilMoisture: z.number().optional(),
  notes: z.string().optional(),
});

const harvestSchema = z.object({
  actualQuantity: z.number().positive(),
  harvestDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  quality: z.enum(["excellent", "good", "average", "poor"]), // ✅ VALEURS UI
  storageLocation: z.string().optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["planned", "in-progress", "completed", "cancelled"]), // ✅ VALEURS UI
});

// Routes
router.get("/", ProductionController.getProductions);
router.get("/:id", ProductionController.getProductionById);
router.post(
  "/",
  requireRole("TECHNICIAN", "ADMIN"),
  validateRequest({ body: createProductionSchema }),
  ProductionController.createProduction
);
router.put(
  "/:id",
  requireRole("TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateProductionSchema }),
  ProductionController.updateProduction
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  ProductionController.deleteProduction
);

// Routes spécifiques
router.post(
  "/:id/activities",
  requireRole("TECHNICIAN", "ADMIN"),
  validateRequest({ body: activitySchema }),
  ProductionController.addActivity
);

router.post(
  "/:id/issues",
  requireRole("TECHNICIAN", "ADMIN"),
  validateRequest({ body: issueSchema }),
  ProductionController.reportIssue
);

router.post(
  "/:id/weather",
  requireRole("TECHNICIAN", "ADMIN"),
  validateRequest({ body: weatherDataSchema }),
  ProductionController.recordWeatherData
);

router.post(
  "/:id/harvest",
  requireRole("TECHNICIAN", "ADMIN"),
  validateRequest({ body: harvestSchema }),
  ProductionController.recordHarvest
);

router.patch(
  "/:id/status",
  requireRole("TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateStatusSchema }),
  ProductionController.updateStatus
);

export default router;
