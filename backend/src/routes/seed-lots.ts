// backend/src/routes/seed-lots.ts - ✅ RENOMMÉ ET CORRIGÉ
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

// ✅ CORRECTION: Middlewares de transformation automatique appliqués
router.use(transformMiddleware.seedLots);
router.use(transformMiddleware.searchFilters);

// ✅ GET /api/seed-lots - Liste des lots de semences
router.get(
  "/",
  parseQueryParams,
  validateRequest({ query: seedLotQuerySchema }),
  SeedLotController.getSeedLots
);

// ✅ GET /api/seed-lots/:id - Détails d'un lot
router.get("/:id", SeedLotController.getSeedLotById);

// ✅ GET /api/seed-lots/:id/genealogy - Arbre généalogique
router.get("/:id/genealogy", SeedLotController.getGenealogyTree);

// ✅ GET /api/seed-lots/:id/qr-code - Code QR du lot
router.get("/:id/qr-code", SeedLotController.getQRCode);

// ✅ POST /api/seed-lots - Créer un nouveau lot
router.post(
  "/",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: createSeedLotSchema }),
  SeedLotController.createSeedLot
);

// ✅ PUT /api/seed-lots/:id - Mettre à jour un lot
router.put(
  "/:id",
  requireRole("RESEARCHER", "TECHNICIAN", "ADMIN"),
  validateRequest({ body: updateSeedLotSchema }),
  SeedLotController.updateSeedLot
);

// ✅ DELETE /api/seed-lots/:id - Supprimer un lot
router.delete("/:id", requireRole("ADMIN"), SeedLotController.deleteSeedLot);

export default router;
