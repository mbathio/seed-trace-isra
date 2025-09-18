// backend/src/routes/users.ts - VERSION NETTOYÉE

import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validateRequest } from "../middleware/validation";
import { requireRole, authMiddleware } from "../middleware/auth";
import { z } from "zod";
import { RoleEnum } from "../validators/common";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: RoleEnum, // Enum Prisma direct
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: RoleEnum.optional(), // Enum Prisma direct
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
});

// Routes
router.get(
  "/",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  UserController.getUsers
);
router.get("/:id", authMiddleware, UserController.getUserById);

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateRequest({ body: createUserSchema }),
  UserController.createUser
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateUserSchema }),
  UserController.updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  UserController.deleteUser
);

router.put(
  "/:id/password",
  authMiddleware,
  validateRequest({ body: updatePasswordSchema }),
  UserController.updatePassword
);

export default router;
