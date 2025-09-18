// backend/src/routes/auth.ts - VERSION UNIFIÉE (sans transformation)

import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateRequest } from "../middleware/validation";
import { authMiddleware } from "../middleware/auth";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from "../validators/auth";

const router = Router();

// ✅ CORRECTION: Plus de middleware de transformation
// router.use(fullTransformation); // ❌ SUPPRIMÉ

// Routes d'authentification
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  AuthController.login
);

router.post(
  "/register",
  validateRequest({ body: registerSchema }), // ✅ Utilise les enums Prisma directement
  AuthController.register
);

router.post(
  "/refresh",
  validateRequest({ body: refreshTokenSchema }),
  AuthController.refreshToken
);

router.post("/logout", AuthController.logout);

router.get("/me", authMiddleware, AuthController.getCurrentUser);

export default router;
