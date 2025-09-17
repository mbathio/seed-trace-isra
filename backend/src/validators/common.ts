// backend/src/validators/common.ts - VERSION CORRIGÉE AVEC DEBUG
import { z } from "zod";

// ✅ CORRECTION CRITIQUE: Enums avec validation stricte - VALEURS UI (format frontend)
// Ces valeurs doivent EXACTEMENT correspondre à ce que le frontend envoie

export const RoleEnum = z.enum(
  [
    "admin",
    "manager",
    "inspector",
    "multiplier",
    "guest",
    "technician",
    "researcher",
  ],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Rôle invalide. Valeurs acceptées: admin, manager, inspector, multiplier, guest, technician, researcher. Reçu: ${issue.received}`,
        };
      }
      return { message: "Rôle invalide" };
    },
  }
);

export const SeedLevelEnum = z.enum(
  ["GO", "G1", "G2", "G3", "G4", "R1", "R2"],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Niveau de semence invalide. Valeurs acceptées: GO, G1, G2, G3, G4, R1, R2. Reçu: ${issue.received}`,
        };
      }
      return { message: "Niveau de semence invalide" };
    },
  }
);

export const CropTypeEnum = z.enum(
  ["rice", "maize", "peanut", "sorghum", "cowpea", "millet", "wheat"],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Type de culture invalide. Valeurs acceptées: rice, maize, peanut, sorghum, cowpea, millet, wheat. Reçu: ${issue.received}`,
        };
      }
      return { message: "Type de culture invalide" };
    },
  }
);

// ✅ CORRECTION CRITIQUE: LotStatusEnum avec valeurs UI exactes
export const LotStatusEnum = z.enum(
  [
    "pending",
    "certified",
    "rejected",
    "in-stock", // ✅ CORRECTION: kebab-case pour UI
    "sold",
    "active",
    "distributed",
  ],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Statut de lot invalide. Valeurs acceptées: pending, certified, rejected, in-stock, sold, active, distributed. Reçu: ${issue.received}`,
        };
      }
      return { message: "Statut de lot invalide" };
    },
  }
);

export const MultiplierStatusEnum = z.enum(["active", "inactive"], {
  errorMap: (issue, _ctx) => {
    if (issue.code === "invalid_enum_value") {
      return {
        message: `Statut multiplicateur invalide. Valeurs acceptées: active, inactive. Reçu: ${issue.received}`,
      };
    }
    return { message: "Statut multiplicateur invalide" };
  },
});

export const CertificationLevelEnum = z.enum(
  ["beginner", "intermediate", "expert"],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Niveau de certification invalide. Valeurs acceptées: beginner, intermediate, expert. Reçu: ${issue.received}`,
        };
      }
      return { message: "Niveau de certification invalide" };
    },
  }
);

export const ParcelStatusEnum = z.enum(["available", "in-use", "resting"], {
  errorMap: (issue, _ctx) => {
    if (issue.code === "invalid_enum_value") {
      return {
        message: `Statut de parcelle invalide. Valeurs acceptées: available, in-use, resting. Reçu: ${issue.received}`,
      };
    }
    return { message: "Statut de parcelle invalide" };
  },
}); // ✅ CORRECTION: kebab-case

export const ContractStatusEnum = z.enum(
  ["draft", "active", "completed", "cancelled"],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Statut de contrat invalide. Valeurs acceptées: draft, active, completed, cancelled. Reçu: ${issue.received}`,
        };
      }
      return { message: "Statut de contrat invalide" };
    },
  }
);

export const ProductionStatusEnum = z.enum(
  [
    "planned",
    "in-progress", // ✅ CORRECTION: kebab-case
    "completed",
    "cancelled",
  ],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Statut de production invalide. Valeurs acceptées: planned, in-progress, completed, cancelled. Reçu: ${issue.received}`,
        };
      }
      return { message: "Statut de production invalide" };
    },
  }
);

export const ActivityTypeEnum = z.enum(
  [
    "soil-preparation", // ✅ CORRECTION: kebab-case pour tous
    "sowing",
    "fertilization",
    "irrigation",
    "weeding",
    "pest-control",
    "harvest",
    "other",
  ],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Type d'activité invalide. Valeurs acceptées: soil-preparation, sowing, fertilization, irrigation, weeding, pest-control, harvest, other. Reçu: ${issue.received}`,
        };
      }
      return { message: "Type d'activité invalide" };
    },
  }
);

export const IssueTypeEnum = z.enum(
  ["disease", "pest", "weather", "management", "other"],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Type de problème invalide. Valeurs acceptées: disease, pest, weather, management, other. Reçu: ${issue.received}`,
        };
      }
      return { message: "Type de problème invalide" };
    },
  }
);

export const IssueSeverityEnum = z.enum(["low", "medium", "high"], {
  errorMap: (issue, _ctx) => {
    if (issue.code === "invalid_enum_value") {
      return {
        message: `Sévérité invalide. Valeurs acceptées: low, medium, high. Reçu: ${issue.received}`,
      };
    }
    return { message: "Sévérité invalide" };
  },
});

export const TestResultEnum = z.enum(["pass", "fail"], {
  errorMap: (issue, _ctx) => {
    if (issue.code === "invalid_enum_value") {
      return {
        message: `Résultat de test invalide. Valeurs acceptées: pass, fail. Reçu: ${issue.received}`,
      };
    }
    return { message: "Résultat de test invalide" };
  },
});

export const ReportTypeEnum = z.enum(
  [
    "production",
    "quality",
    "inventory",
    "multiplier-performance", // ✅ CORRECTION: kebab-case
    "custom",
  ],
  {
    errorMap: (issue, _ctx) => {
      if (issue.code === "invalid_enum_value") {
        return {
          message: `Type de rapport invalide. Valeurs acceptées: production, quality, inventory, multiplier-performance, custom. Reçu: ${issue.received}`,
        };
      }
      return { message: "Type de rapport invalide" };
    },
  }
);

// Schémas de base réutilisables
export const paginationSchema = z.object({
  page: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    return Math.max(1, isNaN(num) ? 1 : num);
  }),
  pageSize: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    return Math.min(Math.max(1, isNaN(num) ? 10 : num), 100);
  }),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Coordonnées GPS avec validation Sénégal
export const coordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .refine((lat) => lat >= 12.0 && lat <= 16.7, {
      message: "Coordonnées en dehors du Sénégal",
    }),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .refine((lng) => lng >= -17.6 && lng <= -11.3, {
      message: "Coordonnées en dehors du Sénégal",
    }),
});

// Dates avec validation
export const dateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Date invalide")
  .transform((date) => new Date(date));

export const optionalDateSchema = z
  .string()
  .optional()
  .refine((date) => !date || !isNaN(Date.parse(date)), "Date invalide")
  .transform((date) => (date ? new Date(date) : undefined));

// Entiers positifs
export const positiveIntSchema = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const num = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(num) || num <= 0) {
      throw new Error("Doit être un entier positif");
    }
    return num;
  });

// Pourcentages
export const percentageSchema = z
  .number()
  .min(0, "Pourcentage doit être >= 0")
  .max(100, "Pourcentage doit être <= 100");

// Email
export const emailSchema = z
  .string()
  .email("Email invalide")
  .toLowerCase()
  .transform((email) => email.trim());

// Téléphone sénégalais
export const phoneSchema = z
  .string()
  .optional()
  .transform((phone) => phone?.replace(/\s+/g, ""))
  .refine((phone) => {
    if (!phone) return true;
    const phoneRegex = /^(\+221)?[0-9]{8,9}$/;
    return phoneRegex.test(phone);
  }, "Numéro de téléphone sénégalais invalide");

// Variety ID (peut être numérique ou string)
export const varietyIdSchema = z.union([
  z.number().positive(),
  z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, "Code variété invalide"),
]);

// Notes/observations
export const notesSchema = z
  .string()
  .max(1000, "Notes ne peuvent pas dépasser 1000 caractères")
  .optional()
  .transform((notes) => notes?.trim() || undefined);

// ID positif générique
export const positiveIdSchema = z.union([
  z.number().positive(),
  z.string().transform((val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("ID invalide");
    }
    return parsed;
  }),
]);

// Multiplier ID
export const multiplierIdSchema = positiveIdSchema;

// Utilitaires de validation
export const ValidationUtils = {
  validateLotId: (lotId: string): boolean => {
    const lotIdRegex = /^SL-(GO|G[1-4]|R[1-2])-\d{4}-\d{3}$/;
    return lotIdRegex.test(lotId);
  },

  isInSenegal: (lat: number, lng: number): boolean => {
    return lat >= 12.0 && lat <= 16.7 && lng >= -17.6 && lng <= -11.3;
  },

  sanitizeText: (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[<>'"]/g, "");
  },
};

// ✅ AJOUT: Schéma pour déboguer les paramètres de requête
export const debugSchema = z
  .object({
    status: LotStatusEnum.optional(),
    level: SeedLevelEnum.optional(),
    cropType: CropTypeEnum.optional(),
    role: RoleEnum.optional(),
  })
  .passthrough();
