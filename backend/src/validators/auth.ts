// backend/src/validators/auth.ts - Validateurs d'authentification CORRIGÉS AVEC VALEURS UI
import { z } from "zod";
import { emailSchema } from "./common";

// ✅ CORRECTION: RoleEnum avec valeurs UI (minuscules)
const RoleEnum = z.enum([
  "admin",
  "manager",
  "inspector",
  "multiplier",
  "guest",
  "technician",
  "researcher",
]);

// ✅ CORRECTION: Schéma de connexion sécurisé
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Mot de passe requis")
    .max(128, "Mot de passe trop long"),
});

// ✅ CORRECTION: Schéma d'inscription avec validation renforcée et rôle UI
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides")
    .transform((val) => val.trim()),
  email: emailSchema,
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    )
    .refine((password) => {
      // Vérification de mots de passe faibles
      const weakPasswords = [
        "password",
        "123456",
        "123456789",
        "qwerty",
        "abc123",
        "password123",
        "admin",
        "letmein",
      ];
      return !weakPasswords.includes(password.toLowerCase());
    }, "Mot de passe trop faible - évitez les mots de passe communs"),
  role: RoleEnum, // ✅ CORRECTION: Accepte valeurs UI minuscules
  avatar: z
    .string()
    .url("URL d'avatar invalide")
    .optional()
    .transform((val) => val || undefined),
});

// Schéma de refresh token sécurisé
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token requis")
    .max(1000, "Refresh token trop long")
    .regex(/^[A-Za-z0-9_-]+$/, "Format de refresh token invalide"),
});

// Schéma de changement de mot de passe
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Mot de passe actuel requis")
      .max(128, "Mot de passe actuel trop long"),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
      .max(128, "Le nouveau mot de passe ne peut pas dépasser 128 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
      ),
    confirmPassword: z.string().min(1, "Confirmation de mot de passe requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ["newPassword"],
  });

// Schéma de mot de passe oublié
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Schéma de réinitialisation de mot de passe
export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Token de réinitialisation requis")
      .max(500, "Token de réinitialisation invalide")
      .regex(/^[A-Za-z0-9_-]+$/, "Format de token invalide"),
    newPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
      ),
    confirmPassword: z.string().min(1, "Confirmation de mot de passe requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma de validation de token
export const validateTokenSchema = z.object({
  token: z.string().min(1, "Token requis").max(1000, "Token trop long"),
});

// Schéma de déconnexion
export const logoutSchema = z.object({
  refreshToken: z.string().optional(), // Optionnel car peut être fourni via cookie
});

// ✅ CORRECTION: Schéma de mise à jour de profil avec rôle UI
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides")
    .optional(),
  email: emailSchema.optional(),
  avatar: z.string().url("URL d'avatar invalide").optional(),
  phone: z
    .string()
    .regex(/^(\+221)?[0-9]{8,9}$/, "Numéro de téléphone sénégalais invalide")
    .optional(),
  role: RoleEnum.optional(), // ✅ CORRECTION: Accepte valeurs UI minuscules
});

// Schéma de vérification d'email
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, "Token de vérification requis")
    .max(500, "Token de vérification invalide"),
  email: emailSchema,
});

// Schéma de renvoi de vérification d'email
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// Schéma d'activation de compte
export const activateAccountSchema = z.object({
  token: z
    .string()
    .min(1, "Token d'activation requis")
    .max(500, "Token d'activation invalide"),
  userId: z.number().positive("ID utilisateur invalide"),
});

// Schéma de désactivation de compte
export const deactivateAccountSchema = z.object({
  reason: z
    .string()
    .min(10, "Raison de désactivation requise (min 10 caractères)")
    .max(500, "Raison trop longue (max 500 caractères)")
    .optional(),
  currentPassword: z
    .string()
    .min(1, "Mot de passe actuel requis pour confirmation"),
});

// Schéma de double authentification
export const twoFactorAuthSchema = z.object({
  enable: z.boolean(),
  code: z
    .string()
    .regex(/^[0-9]{6}$/, "Code à 6 chiffres requis")
    .optional(),
  backupCodes: z.array(z.string()).optional(),
});

// Schéma de connexion avec 2FA
export const loginWith2FASchema = loginSchema.extend({
  twoFactorCode: z
    .string()
    .regex(/^[0-9]{6}$/, "Code à 6 chiffres requis")
    .optional(),
  useBackupCode: z.boolean().optional(),
  backupCode: z.string().min(8, "Code de sauvegarde invalide").optional(),
});

// Schéma de session
export const sessionSchema = z.object({
  deviceInfo: z
    .object({
      userAgent: z.string().max(500),
      ip: z.string().ip(),
      location: z.string().max(100).optional(),
    })
    .optional(),
  rememberMe: z.boolean().optional().default(false),
});

// Schéma de révocation de sessions
export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, "ID de session requis").optional(),
  revokeAll: z.boolean().optional().default(false),
});
