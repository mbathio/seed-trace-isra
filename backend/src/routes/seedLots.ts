// backend/src/routes/seedLots.ts -
import { Router } from "express";
import { SeedLotController } from "../controllers/SeedLotController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { parseQueryParams } from "../middleware/queryParser"; // ✅ NOUVEAU
import {
  createSeedLotSchema,
  updateSeedLotSchema,
  seedLotQuerySchema,
} from "../validators/seedLot";

const router = Router();

// GET /api/seed-lots
router.get(
  "/",
  parseQueryParams, // ✅ NOUVEAU: Parser les query params
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
