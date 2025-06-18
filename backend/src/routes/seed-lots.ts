// backend/src/routes/seed-lots.ts - Routes complètes
import { Router } from "express";
import { SeedLotController } from "../controllers/SeedLotController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { parseQueryParams } from "../middleware/queryParser";
import { seedLotTransformation } from "../middleware/transformationMiddleware";
import {
  createSeedLotSchema,
  updateSeedLotSchema,
  seedLotQuerySchema,
  createChildLotSchema,
  transferLotSchema,
} from "../validators/seedLot";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION À TOUTES LES ROUTES
router.use(seedLotTransformation);

// GET /api/seed-lots - Liste des lots de semences
router.get(
  "/",
  parseQueryParams,
  validateRequest({ query: seedLotQuerySchema }),
  SeedLotController.getSeedLots
);

// GET /api/seed-lots/:id - Détails d'un lot
router.get("/:id", SeedLotController.getSeedLotById);

// GET /api/seed-lots/:id/genealogy - Arbre généalogique
router.get("/:id/genealogy", SeedLotController.getGenealogyTree);

// GET /api/seed-lots/:id/qr-code - Code QR du lot
router.get("/:id/qr-code", SeedLotController.getQRCode);

// POST /api/seed-lots - Créer un nouveau lot
router.post(
  "/",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }),
  SeedLotController.createSeedLot
);

// POST /api/seed-lots/:id/child-lots - Créer un lot enfant
router.post(
  "/:id/child-lots",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createChildLotSchema }),
  SeedLotController.createChildLot
);

// POST /api/seed-lots/:id/transfer - Transférer un lot
router.post(
  "/:id/transfer",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN", "MANAGER"),
  validateRequest({ body: transferLotSchema }),
  SeedLotController.transferLot
);

// PUT /api/seed-lots/:id - Mettre à jour un lot
router.put(
  "/:id",
  authMiddleware,
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }),
  SeedLotController.updateSeedLot
);

// DELETE /api/seed-lots/:id - Supprimer un lot
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  SeedLotController.deleteSeedLot
);

export default router;
