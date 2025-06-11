// backend/src/validators/common.ts - ✅ VERSION CORRIGÉE COMPLÈTE
import { z } from "zod";

// ✅ CORRECTION 1: Enums standardisés (cohérents avec Prisma et mapping BD)
export const RoleEnum = z.enum([
  "ADMIN",
  "MANAGER",
  "INSPECTOR",
  "MULTIPLIER",
  "GUEST",
  "TECHNICIAN",
  "RESEARCHER",
]);

export const SeedLevelEnum = z.enum(["GO", "G1", "G2", "G3", "G4", "R1", "R2"]);

export const CropTypeEnum = z.enum([
  "RICE",
  "MAIZE",
  "PEANUT",
  "SORGHUM",
  "COWPEA",
  "MILLET",
]);

export const LotStatusEnum = z.enum([
  "PENDING",
  "CERTIFIED",
  "REJECTED",
  "IN_STOCK",
  "SOLD",
  "ACTIVE",
  "DISTRIBUTED",
]);

export const MultiplierStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const CertificationLevelEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "EXPERT",
]);

export const ParcelStatusEnum = z.enum(["AVAILABLE", "IN_USE", "RESTING"]);

export const ContractStatusEnum = z.enum([
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const ProductionStatusEnum = z.enum([
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const ActivityTypeEnum = z.enum([
  "SOIL_PREPARATION",
  "SOWING",
  "FERTILIZATION",
  "IRRIGATION",
  "WEEDING",
  "PEST_CONTROL",
  "HARVEST",
  "OTHER",
]);

export const IssueTypeEnum = z.enum([
  "DISEASE",
  "PEST",
  "WEATHER",
  "MANAGEMENT",
  "OTHER",
]);

export const IssueSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const TestResultEnum = z.enum(["PASS", "FAIL"]);

export const ReportTypeEnum = z.enum([
  "PRODUCTION",
  "QUALITY",
  "INVENTORY",
  "MULTIPLIER_PERFORMANCE",
  "CUSTOM",
]);

// ✅ CORRECTION 2: Validateurs communs avec transformation et nettoyage
export const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return Math.max(1, isNaN(num) ? 1 : num);
    })
    .refine((n) => n > 0 && n <= 10000, "Page doit être entre 1 et 10000"),
  pageSize: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return Math.min(Math.max(1, isNaN(num) ? 10 : num), 100);
    })
    .refine((n) => n > 0 && n <= 100, "PageSize doit être entre 1 et 100"),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || val.length >= 2,
      "Recherche doit contenir au moins 2 caractères"
    ),
  sortBy: z.string().max(50, "Nom de champ trop long").optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ✅ CORRECTION 3: Validation GPS avec vérification des bounds du Sénégal
export const coordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude doit être >= -90")
    .max(90, "Latitude doit être <= 90")
    .refine((lat) => !isNaN(lat), "Latitude invalide"),
  longitude: z
    .number()
    .min(-180, "Longitude doit être >= -180")
    .max(180, "Longitude doit être <= 180")
    .refine((lng) => !isNaN(lng), "Longitude invalide"),
});

// ✅ CORRECTION 4: Validation spécifique au Sénégal avec warning
export const senegalCoordinatesSchema = coordinatesSchema.refine(
  ({ latitude, longitude }) => {
    const bounds = {
      latMin: 12.0,
      latMax: 16.7,
      lngMin: -17.6,
      lngMax: -11.3,
    };
    return (
      latitude >= bounds.latMin &&
      latitude <= bounds.latMax &&
      longitude >= bounds.lngMin &&
      longitude <= bounds.lngMax
    );
  },
  {
    message: "Coordonnées en dehors du Sénégal",
    path: ["latitude"], // Point vers latitude pour l'affichage d'erreur
  }
);

// ✅ CORRECTION 5: Validation de dates robuste avec timezone
export const dateSchema = z
  .string()
  .refine((date) => {
    if (!date) return false;
    const parsed = Date.parse(date);
    return !isNaN(parsed);
  }, "Date invalide")
  .transform((date) => {
    const parsed = new Date(date);
    // Vérifier que la date n'est pas dans un futur trop lointain
    const maxFuture = new Date();
    maxFuture.setFullYear(maxFuture.getFullYear() + 10);

    if (parsed > maxFuture) {
      throw new z.ZodError([
        {
          code: "custom",
          message: "Date trop éloignée dans le futur",
          path: [],
        },
      ]);
    }

    return parsed;
  });

export const optionalDateSchema = z
  .string()
  .optional()
  .refine((date) => {
    if (!date) return true;
    return !isNaN(Date.parse(date));
  }, "Date invalide")
  .transform((date) => (date ? new Date(date) : undefined));

// ✅ CORRECTION 6: Validation d'entiers positifs avec transformation
export const positiveIntSchema = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num) || num <= 0) {
      throw new z.ZodError([
        {
          code: "custom",
          message: "Doit être un entier positif",
          path: [],
        },
      ]);
    }
    return num;
  })
  .refine((n) => Number.isInteger(n) && n > 0, "Doit être un entier positif");

// ✅ CORRECTION 7: Validation de pourcentages précise
export const percentageSchema = z
  .number()
  .min(0, "Pourcentage doit être >= 0")
  .max(100, "Pourcentage doit être <= 100")
  .refine((val) => !isNaN(val), "Pourcentage invalide")
  .transform((val) => Math.round(val * 100) / 100); // Arrondir à 2 décimales

// ✅ CORRECTION 8: Validation d'email avec domaines autorisés (optionnel)
export const emailSchema = z
  .string()
  .email("Email invalide")
  .toLowerCase()
  .transform((email) => email.trim())
  .refine((email) => email.length <= 254, "Email trop long")
  .refine((email) => {
    // Vérifier les caractères dangereux
    const dangerousChars = /[<>'"]/;
    return !dangerousChars.test(email);
  }, "Email contient des caractères non autorisés");

// ✅ CORRECTION 9: Validation de téléphone sénégalais améliorée
export const phoneSchema = z
  .string()
  .optional()
  .transform((phone) => phone?.replace(/\s+/g, "")) // Supprimer espaces
  .refine((phone) => {
    if (!phone) return true;
    // Format sénégalais: +221XXXXXXXX ou 7XXXXXXXX
    const phoneRegex = /^(\+221)?[0-9]{8,9}$/;
    return phoneRegex.test(phone);
  }, "Numéro de téléphone sénégalais invalide")
  .transform((phone) => {
    // Normaliser le format
    if (phone && !phone.startsWith("+221") && phone.length === 9) {
      return `+221${phone}`;
    }
    return phone;
  });

// ✅ CORRECTION 10: Schéma flexible pour varietyId (ID numérique ou code string)
export const varietyIdSchema = z.union([
  z.number().positive("ID variété doit être positif"),
  z
    .string()
    .min(1, "Code variété requis")
    .max(20, "Code variété trop long")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Code variété invalide (lettres, chiffres, tirets, underscores uniquement)"
    ),
]);

// ✅ CORRECTION 11: Schéma flexible pour multiplierIdSchema avec validation
export const multiplierIdSchema = z.union([
  z.number().positive("ID multiplicateur doit être positif"),
  z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new z.ZodError([
        {
          code: "custom",
          message: "ID multiplicateur invalide",
          path: [],
        },
      ]);
    }
    return parsed;
  }),
]);

// ✅ CORRECTION 12: Validateur d'ID avec transformation sécurisée
export const positiveIdSchema = z.union([
  z.number().positive("ID doit être positif"),
  z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new z.ZodError([
        {
          code: "custom",
          message: "ID invalide",
          path: [],
        },
      ]);
    }
    return parsed;
  }),
]);

// ✅ CORRECTION 13: Validation de quantité avec unités
export const quantitySchema = z.object({
  value: z
    .number()
    .positive("Quantité doit être positive")
    .max(1000000, "Quantité trop élevée (max 1,000,000)")
    .refine((val) => !isNaN(val), "Quantité invalide"),
  unit: z.enum(["kg", "g", "t", "units"]).default("kg"),
});

// ✅ CORRECTION 14: Validation des résistances de variétés
export const resistancesSchema = z
  .array(
    z
      .string()
      .min(1, "Résistance ne peut pas être vide")
      .max(100, "Nom de résistance trop long")
      .transform((val) => val.trim())
  )
  .max(20, "Maximum 20 résistances autorisées")
  .optional()
  .default([])
  .transform((resistances) => {
    // Supprimer doublons
    return [...new Set(resistances)];
  });

// ✅ CORRECTION 15: Validation des spécialisations avec vérification
export const specializationsSchema = z
  .array(CropTypeEnum)
  .min(1, "Au moins une spécialisation requise")
  .max(6, "Maximum 6 spécialisations autorisées")
  .transform((specs) => {
    // Supprimer doublons
    return [...new Set(specs)];
  });

// ✅ CORRECTION 16: Validation pour les notes/observations
export const notesSchema = z
  .string()
  .max(1000, "Notes ne peuvent pas dépasser 1000 caractères")
  .optional()
  .transform((notes) => notes?.trim() || undefined)
  .refine((notes) => {
    if (!notes) return true;
    // Vérifier les caractères dangereux
    const dangerousPattern = /<script|javascript:|data:text\/html/i;
    return !dangerousPattern.test(notes);
  }, "Notes contiennent du contenu non autorisé");

// ✅ CORRECTION 17: Validation de période de dates avec contraintes métier
export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: "Date de fin doit être après la date de début",
    path: ["endDate"],
  })
  .refine(
    ({ startDate, endDate }) => {
      // Limiter la plage à 5 ans max pour éviter les requêtes trop lourdes
      const diffInYears =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return diffInYears <= 5;
    },
    {
      message: "Période trop longue (maximum 5 ans)",
      path: ["endDate"],
    }
  );

// ✅ CORRECTION 18: Filtres de recherche avancés
export const searchFiltersSchema = z
  .object({
    search: z
      .string()
      .max(100, "Recherche trop longue")
      .optional()
      .transform((val) => val?.trim() || undefined),
    level: SeedLevelEnum.optional(),
    status: LotStatusEnum.optional(),
    cropType: CropTypeEnum.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    varietyId: varietyIdSchema.optional(),
    multiplierId: multiplierIdSchema.optional(),
    parcelId: positiveIdSchema.optional(),
    inspectorId: positiveIdSchema.optional(),
    minQuantity: z.number().positive().optional(),
    maxQuantity: z.number().positive().optional(),
  })
  .refine(
    (data) => {
      // Validation de plage de quantités
      if (data.minQuantity && data.maxQuantity) {
        return data.minQuantity <= data.maxQuantity;
      }
      return true;
    },
    {
      message: "Quantité maximale doit être supérieure à la minimale",
      path: ["maxQuantity"],
    }
  )
  .refine(
    (data) => {
      // Validation de plage de dates
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start <= end;
      }
      return true;
    },
    {
      message: "Date de fin doit être postérieure au début",
      path: ["endDate"],
    }
  );

// ✅ CORRECTION 19: Validation d'upload de fichiers
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, "Nom de fichier requis")
    .max(255, "Nom de fichier trop long")
    .refine((name) => {
      // Vérifier les caractères dangereux
      const dangerousChars = /[<>:"/\\|?*]/;
      return !dangerousChars.test(name);
    }, "Nom de fichier contient des caractères non autorisés"),
  size: z
    .number()
    .positive("Taille de fichier invalide")
    .max(10 * 1024 * 1024, "Fichier trop volumineux (max 10MB)"),
  mimeType: z.string().refine((type) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
    ];
    return allowedTypes.includes(type);
  }, "Type de fichier non autorisé"),
});

// ✅ CORRECTION 20: Utilitaires de validation réutilisables
export const ValidationUtils = {
  // Validation d'un code unique (variété, etc.)
  validateUniqueCode: (code: string): boolean => {
    const codeRegex = /^[A-Z0-9_-]{2,20}$/;
    return codeRegex.test(code);
  },

  // Validation d'un ID de lot
  validateLotId: (lotId: string): boolean => {
    const lotIdRegex = /^SL-(GO|G[1-4]|R[1-2])-\d{4}-\d{3}$/;
    return lotIdRegex.test(lotId);
  },

  // Validation de coordonnées spécifiques au Sénégal
  isInSenegal: (lat: number, lng: number): boolean => {
    return lat >= 12.0 && lat <= 16.7 && lng >= -17.6 && lng <= -11.3;
  },

  // Nettoyage de texte
  sanitizeText: (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ") // Réduire espaces multiples
      .replace(/[<>'"]/g, ""); // Supprimer caractères dangereux
  },

  // Validation de plage de dates
  isValidDateRange: (start: Date, end: Date, maxDays = 1825): boolean => {
    if (start > end) return false;
    const diffInDays =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= maxDays;
  },
};

// ✅ CORRECTION 21: Schémas de métadonnées
export const metadataSchema = z.object({
  createdAt: dateSchema.optional(),
  updatedAt: dateSchema.optional(),
  createdBy: positiveIdSchema.optional(),
  updatedBy: positiveIdSchema.optional(),
  version: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

// ✅ CORRECTION 22: Schéma de tri personnalisé
export const sortSchema = z.object({
  field: z.string().min(1, "Champ de tri requis").max(50),
  direction: z
    .enum(["asc", "desc", "ASC", "DESC"])
    .transform((val) => val.toLowerCase() as "asc" | "desc"),
  priority: z.number().int().min(1).max(10).optional(), // Pour tri multi-colonnes
});

export const multiSortSchema = z
  .array(sortSchema)
  .max(5, "Maximum 5 critères de tri");

// ✅ CORRECTION 23: Export des schémas avec validation de base par défaut
export const createBaseEntitySchema = z.object({
  notes: notesSchema,
  isActive: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional(), // Pour données additionnelles
});

// Export de tous les schémas pour réutilisation
export { ValidationUtils as validationUtils };
