// ===== 1. backend/src/routes/seed-lots.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { SeedLotController } from "../controllers/SeedLotController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { parseQueryParams } from "../middleware/queryParser";
import { seedLotTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import {
  createSeedLotSchema,
  updateSeedLotSchema,
  seedLotQuerySchema,
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
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }),
  SeedLotController.createSeedLot
);

// PUT /api/seed-lots/:id - Mettre à jour un lot
router.put(
  "/:id",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }),
  SeedLotController.updateSeedLot
);

// DELETE /api/seed-lots/:id - Supprimer un lot
router.delete("/:id", requireRole("ADMIN"), SeedLotController.deleteSeedLot);

export default router;
