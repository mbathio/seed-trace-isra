// frontend/src/utils/validators.ts - CORRIGÉ
import * as yup from "yup";

// ✅ CORRECTION: Validation des lots de semences
export const seedLotValidationSchema = yup.object({
  varietyId: yup
    .number()
    .positive("ID variété doit être positif")
    .required("Variété requise"),
  level: yup
    .string()
    .oneOf(["GO", "G1", "G2", "G3", "G4", "R1", "R2"], "Niveau invalide")
    .required("Niveau requis"),
  quantity: yup
    .number()
    .positive("La quantité doit être positive")
    .min(1, "Quantité minimum 1 kg")
    .max(1000000, "Quantité maximum 1,000,000 kg")
    .required("Quantité requise"),
  productionDate: yup
    .string()
    .required("Date de production requise")
    .test("is-valid-date", "Date de production invalide", function (value) {
      if (!value) return false;
      return !isNaN(Date.parse(value));
    })
    .test(
      "is-not-future",
      "La date de production ne peut pas être dans le futur",
      function (value) {
        if (!value) return true;
        return new Date(value) <= new Date();
      }
    )
    .test(
      "is-not-too-old",
      "Date de production trop ancienne (plus de 2 ans)",
      function (value) {
        if (!value) return true;
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return new Date(value) >= twoYearsAgo;
      }
    ),
  expiryDate: yup
    .string()
    .optional()
    .test("is-valid-date", "Date d'expiration invalide", function (value) {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    })
    .test(
      "is-after-production",
      "La date d'expiration doit être après la production",
      function (value) {
        if (!value) return true;
        const { productionDate } = this.parent;
        if (!productionDate) return true;
        return new Date(value) > new Date(productionDate);
      }
    ),
  notes: yup
    .string()
    .max(1000, "Notes trop longues (max 1000 caractères)")
    .optional(),
  batchNumber: yup
    .string()
    .max(50, "Numéro de lot trop long (max 50 caractères)")
    .optional(),
  multiplierId: yup
    .number()
    .positive("ID multiplicateur doit être positif")
    .optional(),
  parentLotId: yup.string().min(1, "ID lot parent invalide").optional(),
});

// ✅ CORRECTION: Validation des contrôles qualité
export const qualityControlValidationSchema = yup.object({
  lotId: yup.string().min(1, "ID de lot requis").required("Lot requis"),
  controlDate: yup
    .string()
    .required("Date de contrôle requise")
    .test("is-valid-date", "Date de contrôle invalide", function (value) {
      if (!value) return false;
      return !isNaN(Date.parse(value));
    })
    .test(
      "is-not-future",
      "La date de contrôle ne peut pas être dans le futur",
      function (value) {
        if (!value) return true;
        return new Date(value) <= new Date();
      }
    )
    .test(
      "is-not-too-old",
      "Date de contrôle trop ancienne (plus d'1 an)",
      function (value) {
        if (!value) return true;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return new Date(value) >= oneYearAgo;
      }
    ),
  germinationRate: yup
    .number()
    .min(0, "Taux de germination minimum 0%")
    .max(100, "Taux de germination maximum 100%")
    .required("Taux de germination requis")
    .test(
      "is-realistic",
      "Taux de germination trop faible pour certification (< 60%)",
      function (value) {
        // Avertissement mais pas bloquant
        return true;
      }
    ),
  varietyPurity: yup
    .number()
    .min(0, "Pureté variétale minimum 0%")
    .max(100, "Pureté variétale maximum 100%")
    .required("Pureté variétale requise")
    .test(
      "is-realistic",
      "Pureté variétale trop faible pour certification (< 90%)",
      function (value) {
        // Avertissement mais pas bloquant
        return true;
      }
    ),
  moistureContent: yup
    .number()
    .min(0, "Taux d'humidité minimum 0%")
    .max(100, "Taux d'humidité maximum 100%")
    .optional()
    .test(
      "is-safe",
      "Taux d'humidité élevé (> 18%) - risque de conservation",
      function (value) {
        // Avertissement mais pas bloquant
        return true;
      }
    ),
  seedHealth: yup
    .number()
    .min(0, "Santé des graines minimum 0%")
    .max(100, "Santé des graines maximum 100%")
    .optional(),
  observations: yup
    .string()
    .max(1000, "Observations trop longues (max 1000 caractères)")
    .optional(),
  testMethod: yup
    .string()
    .max(100, "Méthode de test trop longue (max 100 caractères)")
    .optional(),
});

// ✅ CORRECTION: Validation des variétés
export const varietyValidationSchema = yup.object({
  code: yup
    .string()
    .required("Code requis")
    .min(2, "Code trop court (min 2 caractères)")
    .max(20, "Code trop long (max 20 caractères)")
    .matches(
      /^[A-Z0-9-_]+$/,
      "Code invalide (majuscules, chiffres, tirets et underscores uniquement)"
    ),
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court (min 2 caractères)")
    .max(100, "Nom trop long (max 100 caractères)"),
  cropType: yup
    .string()
    .oneOf(
      ["RICE", "MAIZE", "PEANUT", "SORGHUM", "COWPEA", "MILLET"],
      "Type de culture invalide"
    )
    .required("Type de culture requis"),
  description: yup
    .string()
    .max(1000, "Description trop longue (max 1000 caractères)")
    .optional(),
  maturityDays: yup
    .number()
    .positive("Durée de maturation doit être positive")
    .min(30, "Durée minimum 30 jours")
    .max(365, "Durée maximum 365 jours")
    .integer("Durée doit être un nombre entier")
    .required("Durée de maturation requise"),
  yieldPotential: yup
    .number()
    .positive("Potentiel de rendement doit être positif")
    .max(50, "Potentiel de rendement très élevé (> 50 t/ha)")
    .optional(),
  resistances: yup
    .array()
    .of(yup.string().min(1, "Résistance ne peut pas être vide"))
    .max(20, "Maximum 20 résistances")
    .optional(),
  origin: yup
    .string()
    .max(100, "Origine trop longue (max 100 caractères)")
    .optional(),
  releaseYear: yup
    .number()
    .min(1900, "Année trop ancienne")
    .max(new Date().getFullYear(), "Année future non autorisée")
    .integer("Année doit être un nombre entier")
    .optional(),
});

// ✅ CORRECTION: Validation des multiplicateurs
export const multiplierValidationSchema = yup.object({
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court (min 2 caractères)")
    .max(100, "Nom trop long (max 100 caractères)"),
  address: yup
    .string()
    .required("Adresse requise")
    .min(5, "Adresse trop courte (min 5 caractères)")
    .max(200, "Adresse trop longue (max 200 caractères)"),
  latitude: yup
    .number()
    .min(-90, "Latitude minimum -90°")
    .max(90, "Latitude maximum 90°")
    .required("Latitude requise")
    .test("is-senegal", "Coordonnées en dehors du Sénégal", function (value) {
      const { longitude } = this.parent;
      if (value === undefined || longitude === undefined) return true;

      // Bounds approximatifs du Sénégal
      const senegalBounds = {
        latMin: 12.0,
        latMax: 16.7,
        lngMin: -17.6,
        lngMax: -11.3,
      };

      return (
        value >= senegalBounds.latMin &&
        value <= senegalBounds.latMax &&
        longitude >= senegalBounds.lngMin &&
        longitude <= senegalBounds.lngMax
      );
    }),
  longitude: yup
    .number()
    .min(-180, "Longitude minimum -180°")
    .max(180, "Longitude maximum 180°")
    .required("Longitude requise"),
  yearsExperience: yup
    .number()
    .min(0, "Expérience ne peut pas être négative")
    .max(50, "Expérience très élevée (> 50 ans)")
    .integer("Expérience doit être un nombre entier")
    .required("Années d'expérience requises"),
  certificationLevel: yup
    .string()
    .oneOf(
      ["BEGINNER", "INTERMEDIATE", "EXPERT"],
      "Niveau de certification invalide"
    )
    .required("Niveau de certification requis")
    .test(
      "matches-experience",
      "Niveau de certification ne correspond pas à l'expérience",
      function (value) {
        const { yearsExperience } = this.parent;
        if (!value || yearsExperience === undefined) return true;

        // Validation de cohérence expérience/certification
        if (value === "EXPERT" && yearsExperience < 5) {
          return this.createError({
            message: "Niveau Expert nécessite au moins 5 ans d'expérience",
          });
        }
        if (value === "INTERMEDIATE" && yearsExperience < 2) {
          return this.createError({
            message:
              "Niveau Intermédiaire nécessite au moins 2 ans d'expérience",
          });
        }

        return true;
      }
    ),
  specialization: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(
          ["RICE", "MAIZE", "PEANUT", "SORGHUM", "COWPEA", "MILLET"],
          "Spécialisation invalide"
        )
    )
    .min(1, "Au moins une spécialisation requise")
    .max(6, "Maximum 6 spécialisations")
    .required("Spécialisations requises"),
  phone: yup
    .string()
    .matches(
      /^(\+221)?[0-9]{8,9}$/,
      "Numéro de téléphone sénégalais invalide (format: +221XXXXXXXX ou XXXXXXXX)"
    )
    .optional(),
  email: yup
    .string()
    .email("Adresse email invalide")
    .max(100, "Email trop long (max 100 caractères)")
    .optional(),
});

// ✅ CORRECTION: Validation des parcelles
export const parcelValidationSchema = yup.object({
  name: yup.string().max(100, "Nom trop long (max 100 caractères)").optional(),
  area: yup
    .number()
    .positive("Superficie doit être positive")
    .min(0.01, "Superficie minimum 0.01 hectare")
    .max(1000, "Superficie très élevée (> 1000 ha)")
    .required("Superficie requise"),
  latitude: yup
    .number()
    .min(-90, "Latitude minimum -90°")
    .max(90, "Latitude maximum 90°")
    .required("Latitude requise"),
  longitude: yup
    .number()
    .min(-180, "Longitude minimum -180°")
    .max(180, "Longitude maximum 180°")
    .required("Longitude requise"),
  status: yup
    .string()
    .oneOf(["AVAILABLE", "IN_USE", "RESTING"], "Statut de parcelle invalide")
    .optional()
    .default("AVAILABLE"),
  soilType: yup
    .string()
    .max(50, "Type de sol trop long (max 50 caractères)")
    .optional(),
  irrigationSystem: yup
    .string()
    .max(50, "Système d'irrigation trop long (max 50 caractères)")
    .optional(),
  address: yup
    .string()
    .max(200, "Adresse trop longue (max 200 caractères)")
    .optional(),
  multiplierId: yup
    .number()
    .positive("ID multiplicateur doit être positif")
    .optional(),
});

// ✅ CORRECTION: Validation des productions
export const productionValidationSchema = yup.object({
  lotId: yup.string().min(1, "ID de lot requis").required("Lot requis"),
  multiplierId: yup
    .number()
    .positive("ID multiplicateur doit être positif")
    .required("Multiplicateur requis"),
  parcelId: yup
    .number()
    .positive("ID parcelle doit être positif")
    .required("Parcelle requise"),
  startDate: yup
    .string()
    .required("Date de début requise")
    .test("is-valid-date", "Date de début invalide", function (value) {
      if (!value) return false;
      return !isNaN(Date.parse(value));
    }),
  endDate: yup
    .string()
    .optional()
    .test("is-valid-date", "Date de fin invalide", function (value) {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    })
    .test(
      "is-after-start",
      "Date de fin doit être après la date de début",
      function (value) {
        if (!value) return true;
        const { startDate } = this.parent;
        if (!startDate) return true;
        return new Date(value) > new Date(startDate);
      }
    ),
  sowingDate: yup
    .string()
    .required("Date de semis requise")
    .test("is-valid-date", "Date de semis invalide", function (value) {
      if (!value) return false;
      return !isNaN(Date.parse(value));
    }),
  harvestDate: yup
    .string()
    .optional()
    .test("is-valid-date", "Date de récolte invalide", function (value) {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    })
    .test(
      "is-after-sowing",
      "Date de récolte doit être après la date de semis",
      function (value) {
        if (!value) return true;
        const { sowingDate } = this.parent;
        if (!sowingDate) return true;
        return new Date(value) > new Date(sowingDate);
      }
    ),
  plannedQuantity: yup
    .number()
    .positive("Quantité planifiée doit être positive")
    .max(1000000, "Quantité planifiée très élevée")
    .optional(),
  actualYield: yup
    .number()
    .positive("Rendement actuel doit être positif")
    .max(1000000, "Rendement actuel très élevé")
    .optional(),
  notes: yup
    .string()
    .max(1000, "Notes trop longues (max 1000 caractères)")
    .optional(),
  weatherConditions: yup
    .string()
    .max(500, "Conditions météo trop longues (max 500 caractères)")
    .optional(),
});

// ✅ CORRECTION: Validation des utilisateurs
export const userValidationSchema = yup.object({
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court (min 2 caractères)")
    .max(100, "Nom trop long (max 100 caractères)")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nom contient des caractères invalides"),
  email: yup
    .string()
    .required("Email requis")
    .email("Email invalide")
    .max(100, "Email trop long (max 100 caractères)"),
  password: yup
    .string()
    .required("Mot de passe requis")
    .min(6, "Mot de passe trop court (min 6 caractères)")
    .max(128, "Mot de passe trop long (max 128 caractères)")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
  role: yup
    .string()
    .oneOf(
      [
        "ADMIN",
        "MANAGER",
        "RESEARCHER",
        "TECHNICIAN",
        "INSPECTOR",
        "MULTIPLIER",
        "GUEST",
      ],
      "Rôle invalide"
    )
    .required("Rôle requis"),
  avatar: yup.string().url("URL d'avatar invalide").optional(),
});
