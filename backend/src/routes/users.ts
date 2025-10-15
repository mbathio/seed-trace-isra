// backend/src/routes/users.ts
import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validateRequest } from "../middleware/validation";
import { authMiddleware, requireRole } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import { z } from "zod";

const router = Router();

// ✅ Ordre important : transformation AVANT validation
router.use(fullTransformation);
router.use(authMiddleware);

// ✅ Accepter les valeurs en MAJUSCULES (après transformation)
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
  ]), // ✅ EN MAJUSCULES
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
    ])
    .optional(), // ✅ EN MAJUSCULES
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