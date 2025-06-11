// backend/src/routes/seedLots.ts - ✅ VERSION CORRIGÉE
import { Router } from "express";
import { SeedLotController } from "../controllers/SeedLotController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { parseQueryParams } from "../middleware/queryParser";
import { transformMiddleware } from "../middleware/transformationMiddleware";
import {
  createSeedLotSchema,
  updateSeedLotSchema,
  seedLotQuerySchema,
} from "../validators/seedLot";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION AUTOMATIQUE
router.use(transformMiddleware.seedLots);
router.use(transformMiddleware.searchFilters);

// GET /api/seed-lots
router.get(
  "/",
  parseQueryParams,
  validateRequest({ query: seedLotQuerySchema }),
  SeedLotController.getSeedLots
);

// GET /api/seed-lots/:id
router.get("/:id", SeedLotController.getSeedLotById);

// GET /api/seed-lots/:id/genealogy
router.get("/:id/genealogy", SeedLotController.getGenealogyTree);

// GET /api/seed-lots/:id/qr-code
router.get("/:id/qr-code", SeedLotController.getQRCode);

// POST /api/seed-lots
router.post(
  "/",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }),
  SeedLotController.createSeedLot
);

// PUT /api/seed-lots/:id
router.put(
  "/:id",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }),
  SeedLotController.updateSeedLot
);

// DELETE /api/seed-lots/:id
router.delete("/:id", requireRole("ADMIN"), SeedLotController.deleteSeedLot);

export default router;

// backend/src/routes/varieties.ts - ✅ VERSION CORRIGÉE
import { Router } from "express";
import { VarietyController } from "../controllers/VarietyController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { transformMiddleware } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(transformMiddleware.varieties);
router.use(transformMiddleware.searchFilters);

const createVarietySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  cropType: z.enum(["rice", "maize", "peanut", "sorghum", "cowpea", "millet"]), // ✅ Frontend values
  description: z.string().optional(),
  maturityDays: z.number().positive(),
  yieldPotential: z.number().positive().optional(),
  resistances: z.array(z.string()).optional(),
  origin: z.string().optional(),
  releaseYear: z.number().optional(),
});

const updateVarietySchema = createVarietySchema.partial().omit({ code: true });

// GET /api/varieties
router.get("/", VarietyController.getVarieties);

// GET /api/varieties/:id
router.get("/:id", VarietyController.getVarietyById);

// POST /api/varieties
router.post(
  "/",
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: createVarietySchema }),
  VarietyController.createVariety
);

// PUT /api/varieties/:id
router.put(
  "/:id",
  requireRole("RESEARCHER", "ADMIN"),
  validateRequest({ body: updateVarietySchema }),
  VarietyController.updateVariety
);

// DELETE /api/varieties/:id
router.delete("/:id", requireRole("ADMIN"), VarietyController.deleteVariety);

export default router;

// backend/src/routes/multipliers.ts - ✅ VERSION CORRIGÉE
import { Router } from "express";
import { MultiplierController } from "../controllers/MultiplierController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { transformMiddleware } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(transformMiddleware.multipliers);
router.use(transformMiddleware.searchFilters);

const createMultiplierSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  yearsExperience: z.number().min(0),
  certificationLevel: z.enum(["beginner", "intermediate", "expert"]), // ✅ Frontend values
  specialization: z.array(
    z.enum(["rice", "maize", "peanut", "sorghum", "cowpea", "millet"])
  ), // ✅ Frontend values
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(["active", "inactive"]).optional(), // ✅ Frontend values
});

const updateMultiplierSchema = createMultiplierSchema.partial();

const contractSchema = z.object({
  varietyId: z.union([z.number().positive(), z.string()]),
  startDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  endDate: z.string().refine((date: string) => !isNaN(Date.parse(date))),
  seedLevel: z.enum(["go", "g1", "g2", "g3", "g4", "r1", "r2"]), // ✅ Frontend values
  expectedQuantity: z.number().positive(),
  parcelId: z.number().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]).optional(), // ✅ Frontend values
});

// Routes avec transformations automatiques
router.get("/", MultiplierController.getMultipliers);
router.get("/:id", MultiplierController.getMultiplierById);
router.post(
  "/",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: createMultiplierSchema }),
  MultiplierController.createMultiplier
);
router.put(
  "/:id",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateMultiplierSchema }),
  MultiplierController.updateMultiplier
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  MultiplierController.deleteMultiplier
);
router.get("/:id/contracts", MultiplierController.getContracts);
router.post(
  "/:id/contracts",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: contractSchema }),
  MultiplierController.createContract
);

export default router;

// backend/src/routes/qualityControls.ts - ✅ VERSION CORRIGÉE
import { Router } from "express";
import { QualityControlController } from "../controllers/QualityControlController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { transformMiddleware } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(transformMiddleware.qualityControls);
router.use(transformMiddleware.searchFilters);

const createQualityControlSchema = z.object({
  lotId: z.string().min(1),
  controlDate: z.string().refine((date) => !isNaN(Date.parse(date))),
  germinationRate: z.number().min(0).max(100),
  varietyPurity: z.number().min(0).max(100),
  moistureContent: z.number().min(0).max(100).optional(),
  seedHealth: z.number().min(0).max(100).optional(),
  observations: z.string().max(1000).optional(),
  testMethod: z.string().max(100).optional(),
  laboratoryRef: z.string().max(50).optional(),
  certificateUrl: z.string().url().optional(),
});

const updateQualityControlSchema = createQualityControlSchema.partial().extend({
  result: z.enum(["pass", "fail"]).optional(), // ✅ Frontend values
});

// Routes avec transformations automatiques
router.get("/", QualityControlController.getQualityControls);
router.get("/:id", QualityControlController.getQualityControlById);
router.post(
  "/",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: createQualityControlSchema }),
  QualityControlController.createQualityControl
);
router.put(
  "/:id",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: updateQualityControlSchema }),
  QualityControlController.updateQualityControl
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  QualityControlController.deleteQualityControl
);

export default router;

// backend/src/routes/productions.ts - ✅ VERSION CORRIGÉE
import { Router } from "express";
import { ProductionController } from "../controllers/ProductionController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { transformMiddleware } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(transformMiddleware.productions);
router.use(transformMiddleware.searchFilters);

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
  status: z
    .enum(["planned", "in-progress", "completed", "cancelled"])
    .optional(), // ✅ Frontend values
});

const updateProductionSchema = createProductionSchema.partial().omit({
  lotId: true,
  multiplierId: true,
  parcelId: true,
});

const activitySchema = z.object({
  type: z.enum([
    "soil-preparation",
    "sowing",
    "fertilization",
    "irrigation",
    "weeding",
    "pest-control",
    "harvest",
    "other",
  ]), // ✅ Frontend values
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
  type: z.enum(["disease", "pest", "weather", "management", "other"]), // ✅ Frontend values
  description: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]), // ✅ Frontend values
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

// Routes avec transformations automatiques
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

// backend/src/routes/users.ts - ✅ VERSION CORRIGÉE
import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { transformMiddleware } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(transformMiddleware.users);
router.use(transformMiddleware.searchFilters);

const createUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum([
    "admin",
    "manager",
    "inspector",
    "multiplier",
    "guest",
    "technician",
    "researcher",
  ]), // ✅ Frontend values
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z
    .enum([
      "admin",
      "manager",
      "inspector",
      "multiplier",
      "guest",
      "technician",
      "researcher",
    ])
    .optional(), // ✅ Frontend values
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
});

// Routes avec transformations automatiques
router.get("/", requireRole("MANAGER", "ADMIN"), UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.post(
  "/",
  requireRole("ADMIN"),
  validateRequest({ body: createUserSchema }),
  UserController.createUser
);
router.put(
  "/:id",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateUserSchema }),
  UserController.updateUser
);
router.delete("/:id", requireRole("ADMIN"), UserController.deleteUser);
router.put(
  "/:id/password",
  validateRequest({ body: updatePasswordSchema }),
  UserController.updatePassword
);

export default router;
