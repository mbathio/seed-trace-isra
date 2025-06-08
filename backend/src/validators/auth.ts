// backend/src/validators/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.enum([
    "ADMIN", // ✅ MAJUSCULES
    "MANAGER",
    "INSPECTOR",
    "MULTIPLIER",
    "GUEST",
    "TECHNICIAN",
    "RESEARCHER",
  ]),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token requis"),
});
