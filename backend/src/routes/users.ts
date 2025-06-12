// ===== 7. backend/src/routes/users.ts - AVEC TRANSFORMATION =====
import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { userTransformation } from "../middleware/transformationMiddleware"; // ✅ AJOUTÉ
import { z } from "zod";

const router = Router();

// ✅ APPLIQUER LE MIDDLEWARE DE TRANSFORMATION
router.use(userTransformation);

const createUserSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum([
    "admin",
    "manager",
    "inspector",
    "multiplier",
    "guest",
    "technician",
    "researcher",
  ]), // ✅ VALEURS UI
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z
    .enum([
      "admin",
      "manager",
      "inspector",
      "multiplier",
      "guest",
      "technician",
      "researcher",
    ])
    .optional(), // ✅ VALEURS UI
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
});

// Routes...
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
