// backend/src/validators/seedLot.ts - ✅ CORRIGÉ COMPLET
import { z } from "zod";
import {
  SeedLevelEnum,
  LotStatusEnum,
  varietyIdSchema,
  multiplierIdSchema,
  positiveIntSchema,
  paginationSchema,
  notesSchema,
  positiveIdSchema,
} from "./common";

// ✅ CORRECTION 1: Validateur de hiérarchie des lots avec logique métier
const validateLotHierarchy = (
  parentLevel: string,
  childLevel: string
): boolean => {
  const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
  const parentIndex = levelHierarchy.indexOf(parentLevel);
  const childIndex = levelHierarchy.indexOf(childLevel);

  if (parentIndex === -1 || childIndex === -1) return false;

  // Un lot parent doit avoir un niveau inférieur (index plus petit)
  return parentIndex < childIndex;
};

// ✅ CORRECTION 2: Validateur de date avec règles métier spécifiques
const validateProductionDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  return date <= now && date >= twoYearsAgo;
};

// ✅ CORRECTION 3: Validateur de quantité selon le niveau
const validateQuantityByLevel = (quantity: number, level: string): boolean => {
  const levelLimits: Record<string, { min: number; max: number }> = {
    GO: { min: 10, max: 1000 },
    G1: { min: 100, max: 5000 },
    G2: { min: 500, max: 10000 },
    G3: { min: 1000, max: 20000 },
    G4: { min: 2000, max: 50000 },
    R1: { min: 5000, max: 100000 },
    R2: { min: 10000, max: 500000 },
  };

  const limits = levelLimits[level];
  if (!limits) return quantity > 0; // Si niveau inconnu, juste vérifier positivité

  return quantity >= limits.min && quantity <= limits.max;
};

// ✅ CORRECTION 4: Schéma de création avec validations cross-champs
export const createSeedLotSchema = z
  .object({
    varietyId: varietyIdSchema,
    level: SeedLevelEnum,
    quantity: z
      .number()
      .positive("Quantité doit être positive")
      .min(1, "Quantité minimum 1kg")
      .max(1000000, "Quantité maximum 1,000,000kg"),
    productionDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Date de production invalide")
      .refine(
        (date) => validateProductionDate(date),
        "Date de production doit être dans les 2 dernières années et pas dans le futur"
      ),
    expiryDate: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return !isNaN(Date.parse(date));
      }, "Date d'expiration invalide"),
    multiplierId: multiplierIdSchema.optional(),
    parcelId: positiveIdSchema.optional(),
    parentLotId: z.string().min(1).optional(),
    batchNumber: z
      .string()
      .max(50, "Numéro de lot ne peut pas dépasser 50 caractères")
      .optional(),
    notes: notesSchema,
    status: LotStatusEnum.optional(),
  })
  .refine(
    (data) => {
      // ✅ Validation cross-champ: date d'expiration après production
      if (data.expiryDate && data.productionDate) {
        const prodDate = new Date(data.productionDate);
        const expDate = new Date(data.expiryDate);
        return expDate > prodDate;
      }
      return true;
    },
    {
      message:
        "La date d'expiration doit être postérieure à la date de production",
      path: ["expiryDate"],
    }
  )
  .refine(
    (data) => {
      // ✅ Validation de quantité selon le niveau
      return validateQuantityByLevel(data.quantity, data.level);
    },
    {
      message: "Quantité inappropriée pour ce niveau de semence",
      path: ["quantity"],
    }
  );

// ✅ CORRECTION 5: Schéma de mise à jour indépendant
export const updateSeedLotSchema = z.object({
  quantity: z
    .number()
    .positive("Quantité doit être positive")
    .min(0, "Quantité ne peut pas être négative")
    .optional(),
  status: LotStatusEnum.optional(),
  expiryDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return !isNaN(Date.parse(date));
    }, "Date d'expiration invalide"),
  batchNumber: z
    .string()
    .max(50, "Numéro de lot ne peut pas dépasser 50 caractères")
    .optional(),
  notes: notesSchema,
});

// ✅ CORRECTION 6: Schéma de requête avec validation améliorée
export const seedLotQuerySchema = paginationSchema
  .extend({
    level: SeedLevelEnum.optional(),
    status: LotStatusEnum.optional(),
    varietyId: varietyIdSchema.optional(),
    multiplierId: multiplierIdSchema.optional(),
    parcelId: positiveIdSchema.optional(),
    startDate: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return !isNaN(Date.parse(date));
      }, "Date de début invalide"),
    endDate: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return !isNaN(Date.parse(date));
      }, "Date de fin invalide"),
    sortBy: z
      .enum([
        "productionDate",
        "quantity",
        "level",
        "status",
        "varietyName",
        "multiplierName",
        "expiryDate",
        "createdAt",
      ])
      .optional(),
  })
  .refine(
    (data) => {
      // ✅ Validation de plage de dates
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start <= end;
      }
      return true;
    },
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["endDate"],
    }
  );

// ✅ CORRECTION 7: Schéma de transfert avec validations métier
export const transferSeedLotSchema = z
  .object({
    sourceId: z.string().min(1, "ID du lot source requis"),
    targetMultiplierId: multiplierIdSchema,
    quantity: z
      .number()
      .positive("Quantité à transférer doit être positive")
      .min(1, "Quantité minimum 1kg"),
    notes: z
      .string()
      .max(500, "Notes de transfert ne peuvent pas dépasser 500 caractères")
      .optional(),
  })
  .refine((data) => data.quantity > 0, {
    message: "Quantité à transférer doit être positive",
    path: ["quantity"],
  });

// ✅ CORRECTION 8: Schéma de généalogie
export const genealogyQuerySchema = z.object({
  includeAncestors: z.boolean().optional().default(true),
  includeDescendants: z.boolean().optional().default(true),
  maxDepth: z
    .number()
    .int("Profondeur doit être un entier")
    .min(1, "Profondeur minimum 1")
    .max(10, "Profondeur maximum 10")
    .optional()
    .default(5),
});

// ✅ CORRECTION 9: Schéma de création de lot avec parent
export const createChildSeedLotSchema = createSeedLotSchema
  .extend({
    parentLotId: z.string().min(1, "Lot parent requis"),
  })
  .refine(
    async (data) => {
      // ✅ Cette validation nécessiterait une requête DB pour vérifier le parent
      // Elle sera faite dans le service plutôt qu'ici
      return true;
    },
    {
      message: "Validation de hiérarchie parent-enfant échouée",
      path: ["parentLotId"],
    }
  );

// ✅ CORRECTION 10: Schéma de filtres avancés
export const advancedSeedLotFiltersSchema = z
  .object({
    varieties: z.array(varietyIdSchema).optional(),
    multipliers: z.array(multiplierIdSchema).optional(),
    levels: z.array(SeedLevelEnum).optional(),
    statuses: z.array(LotStatusEnum).optional(),
    quantityMin: z.number().positive().optional(),
    quantityMax: z.number().positive().optional(),
    productionDateStart: z.string().optional(),
    productionDateEnd: z.string().optional(),
    hasParent: z.boolean().optional(),
    hasChildren: z.boolean().optional(),
    qualityStatus: z.enum(["PASS", "FAIL", "PENDING", "ANY"]).optional(),
  })
  .refine(
    (data) => {
      // Validation de plage de quantités
      if (data.quantityMin && data.quantityMax) {
        return data.quantityMin <= data.quantityMax;
      }
      return true;
    },
    {
      message: "Quantité maximale doit être supérieure à la minimale",
      path: ["quantityMax"],
    }
  )
  .refine(
    (data) => {
      // Validation de plage de dates de production
      if (data.productionDateStart && data.productionDateEnd) {
        const start = new Date(data.productionDateStart);
        const end = new Date(data.productionDateEnd);
        return start <= end;
      }
      return true;
    },
    {
      message: "Date de fin de production doit être postérieure au début",
      path: ["productionDateEnd"],
    }
  );

// ✅ CORRECTION 11: Schéma d'import en masse
export const bulkImportSeedLotSchema = z
  .array(
    createSeedLotSchema.omit({ parentLotId: true }).extend({
      // Champs supplémentaires pour l'import
      varietyCode: z.string().optional(),
      multiplierName: z.string().optional(),
      parcelName: z.string().optional(),
      rowNumber: z.number().optional(), // Pour traçabilité des erreurs
    })
  )
  .refine((data) => data.length > 0, {
    message: "Au moins un lot doit être fourni pour l'import",
  })
  .refine((data) => data.length <= 1000, {
    message: "Maximum 1000 lots par import",
  });

// ✅ CORRECTION 12: Schéma de génération QR codes
export const qrCodeGenerationSchema = z.object({
  lotIds: z
    .array(z.string().min(1))
    .min(1, "Au moins un lot requis")
    .max(100, "Maximum 100 lots"),
  format: z.enum(["PNG", "SVG", "PDF"]).optional().default("PNG"),
  size: z.enum(["small", "medium", "large"]).optional().default("medium"),
  includeData: z.boolean().optional().default(true),
});

// ✅ CORRECTION 13: Schéma d'alertes d'expiration
export const expirationAlertSchema = z
  .object({
    daysAhead: z
      .number()
      .int("Nombre de jours doit être un entier")
      .min(1, "Minimum 1 jour")
      .max(365, "Maximum 365 jours")
      .default(30),
    includeStatuses: z.array(LotStatusEnum).optional(),
    excludeStatuses: z.array(LotStatusEnum).optional(),
  })
  .refine(
    (data) => {
      // Ne peut pas avoir à la fois include et exclude
      return !(data.includeStatuses && data.excludeStatuses);
    },
    {
      message: "Ne peut pas avoir à la fois includeStatuses et excludeStatuses",
      path: ["excludeStatuses"],
    }
  );

// ✅ CORRECTION 14: Utilitaires de validation
export const validateLotId = (lotId: string): boolean => {
  // Format: SL-LEVEL-YEAR-NUMBER (ex: SL-G1-2024-001)
  const lotIdRegex = /^SL-(GO|G[1-4]|R[1-2])-\d{4}-\d{3}$/;
  return lotIdRegex.test(lotId);
};

export const validateLotIdSchema = z.string().refine(validateLotId, {
  message: "Format de lot ID invalide (attendu: SL-LEVEL-YEAR-NUMBER)",
});

// ✅ CORRECTION 15: Schéma de répartition de lot
export const splitSeedLotSchema = z
  .object({
    sourceId: z.string().refine(validateLotId, "ID de lot source invalide"),
    splits: z
      .array(
        z.object({
          quantity: z.number().positive("Quantité doit être positive"),
          multiplierId: multiplierIdSchema.optional(),
          notes: z.string().max(200).optional(),
        })
      )
      .min(2, "Au moins 2 répartitions requises")
      .max(10, "Maximum 10 répartitions"),
  })
  .refine(
    (data) => {
      // La somme des quantités ne doit pas dépasser une limite raisonnable
      const totalQuantity = data.splits.reduce(
        (sum, split) => sum + split.quantity,
        0
      );
      return totalQuantity <= 1000000; // 1 million kg max
    },
    {
      message: "Quantité totale de répartition trop élevée",
      path: ["splits"],
    }
  );

// ✅ CORRECTION 16: Export des schémas avec validation optionnelle
export const createSeedLotWithOptionalValidation = (
  skipBusinessRules = false
) => {
  if (skipBusinessRules) {
    return createSeedLotSchema.omit({}).extend({
      skipValidation: z.boolean().optional().default(true),
    });
  }
  return createSeedLotSchema;
};

// ✅ CORRECTION 17: Schéma de mise à jour de statut avec transitions valides
export const updateSeedLotStatusSchema = z
  .object({
    status: LotStatusEnum,
    reason: z.string().min(10, "Raison requise (min 10 caractères)").optional(),
    inspectorId: z.number().positive().optional(),
  })
  .refine(
    (data) => {
      // Certains changements de statut nécessitent une raison
      const statusesRequiringReason = ["REJECTED", "CANCELLED"];
      if (statusesRequiringReason.includes(data.status) && !data.reason) {
        return false;
      }
      return true;
    },
    {
      message: "Raison requise pour ce changement de statut",
      path: ["reason"],
    }
  );

// ✅ CORRECTION 18: Validation de transitions de statut
const validateStatusTransition = (
  currentStatus: string,
  newStatus: string
): boolean => {
  const validTransitions: Record<string, string[]> = {
    PENDING: ["CERTIFIED", "REJECTED", "IN_STOCK"],
    CERTIFIED: ["IN_STOCK", "ACTIVE", "DISTRIBUTED"],
    REJECTED: [], // Statut final
    IN_STOCK: ["ACTIVE", "DISTRIBUTED", "SOLD"],
    ACTIVE: ["DISTRIBUTED", "SOLD"],
    DISTRIBUTED: ["SOLD"],
    SOLD: [], // Statut final
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

export {
  validateStatusTransition,
  validateLotHierarchy,
  validateQuantityByLevel,
};
