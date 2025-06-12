// ===== 9. backend/src/routes/auth.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateRequest } from "../middleware/validation";
import { authMiddleware } from "../middleware/auth";
import { userTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
} from "../validators/auth";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION pour transformer les rôles
router.use(userTransformation);

// Routes...
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  AuthController.login
);
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
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
