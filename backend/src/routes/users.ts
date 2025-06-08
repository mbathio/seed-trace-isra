// backend/src/routes/users.ts - Version corrigée avec énumérations

import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum([
    "ADMIN",
    "MANAGER",
    "INSPECTOR",
    "MULTIPLIER",
    "GUEST",
    "TECHNICIAN",
    "RESEARCHER",
  ]), // ✅ Majuscules cohérentes
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z
    .enum([
      "ADMIN",
      "MANAGER",
      "INSPECTOR",
      "MULTIPLIER",
      "GUEST",
      "TECHNICIAN",
      "RESEARCHER",
    ]) // ✅ Majuscules cohérentes
    .optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
});

// GET /api/users
router.get("/", requireRole("MANAGER", "ADMIN"), UserController.getUsers);

// GET /api/users/:id
router.get("/:id", UserController.getUserById);

// POST /api/users
router.post(
  "/",
  requireRole("ADMIN"),
  validateRequest({ body: createUserSchema }),
  UserController.createUser
);

// PUT /api/users/:id
router.put(
  "/:id",
  requireRole("MANAGER", "ADMIN"),
  validateRequest({ body: updateUserSchema }),
  UserController.updateUser
);

// DELETE /api/users/:id
router.delete("/:id", requireRole("ADMIN"), UserController.deleteUser);

// PUT /api/users/:id/password
router.put(
  "/:id/password",
  validateRequest({ body: updatePasswordSchema }),
  UserController.updatePassword
);

export default router;
