// backend/src/routes/auth.ts
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

// POST /api/auth/login
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  AuthController.login
);

// POST /api/auth/register
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  AuthController.register
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  validateRequest({ body: refreshTokenSchema }),
  AuthController.refreshToken
);

// POST /api/auth/logout
router.post("/logout", AuthController.logout);

// GET /api/auth/me
router.get("/me", authMiddleware, AuthController.getCurrentUser);

export default router;
