// frontend/src/utils/validators.ts - VERSION CORRIGÉE AVEC VALEURS UI
import * as yup from "yup";

// ✅ CORRIGÉ: Validation avec valeurs UI pour seedLot
export const seedLotValidationSchema = yup.object({
  varietyId: yup.number().required("Variété requise").positive("ID invalide"),
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
    .test("valid-date", "Date de production invalide", (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test("not-future", "La date ne peut pas être dans le futur", (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date <= new Date();
    }),
  expiryDate: yup
    .string()
    .optional()
    .test("valid-date", "Date d'expiration invalide", (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  notes: yup
    .string()
    .max(1000, "Notes trop longues (max 1000 caractères)")
    .optional(),
  batchNumber: yup.string().max(50, "Numéro de lot trop long").optional(),
  multiplierId: yup.number().positive().optional(),
  parentLotId: yup.string().optional(),
});

// ✅ CORRIGÉ: Validation avec valeurs UI pour variety
export const varietyValidationSchema = yup.object({
  code: yup
    .string()
    .required("Code requis")
    .min(2, "Code trop court")
    .max(20, "Code trop long")
    .matches(
      /^[A-Z0-9]+$/,
      "Code doit contenir uniquement des lettres majuscules et des chiffres"
    ),
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court")
    .max(100, "Nom trop long"),
  cropType: yup
    .string()
    // ✅ CORRIGÉ: Utiliser les valeurs UI (minuscules) au lieu des valeurs DB
    .oneOf(
      ["rice", "maize", "peanut", "sorghum", "cowpea", "millet", "wheat"],
      "Type de culture invalide"
    )
    .required("Type de culture requis"),
  description: yup.string().max(1000, "Description trop longue").optional(),
  maturityDays: yup
    .number()
    .positive("Durée doit être positive")
    .min(30, "Minimum 30 jours")
    .max(365, "Maximum 365 jours")
    .required("Durée de maturité requise"),
  yieldPotential: yup
    .number()
    .positive("Rendement doit être positif")
    .max(50, "Maximum 50 t/ha")
    .optional(),
  origin: yup.string().max(100, "Origine trop longue").optional(),
  releaseYear: yup
    .number()
    .positive()
    .min(1900, "Année trop ancienne")
    .max(new Date().getFullYear(), "Année ne peut pas être dans le futur")
    .optional(),
  resistances: yup.array().of(yup.string()).optional(),
});

// ✅ CORRIGÉ: Validation avec valeurs UI pour qualityControl
export const qualityControlValidationSchema = yup.object({
  lotId: yup.string().required("Lot requis"),
  controlDate: yup
    .string()
    .required("Date de contrôle requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    })
    .test("not-future", "Date ne peut pas être dans le futur", (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
  germinationRate: yup
    .number()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%")
    .required("Taux de germination requis"),
  varietyPurity: yup
    .number()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%")
    .required("Pureté variétale requise"),
  moistureContent: yup
    .number()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%")
    .optional(),
  seedHealth: yup
    .number()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%")
    .optional(),
  observations: yup.string().max(1000, "Observations trop longues").optional(),
  testMethod: yup.string().max(100, "Méthode trop longue").optional(),
});

// ✅ AJOUTÉ: Validation pour multiplier avec valeurs UI
export const multiplierValidationSchema = yup.object({
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court")
    .max(100, "Nom trop long"),
  address: yup
    .string()
    .required("Adresse requise")
    .max(255, "Adresse trop longue"),
  latitude: yup
    .number()
    .min(-90, "Latitude invalide")
    .max(90, "Latitude invalide")
    .required("Latitude requise"),
  longitude: yup
    .number()
    .min(-180, "Longitude invalide")
    .max(180, "Longitude invalide")
    .required("Longitude requise"),
  yearsExperience: yup
    .number()
    .min(0, "Expérience ne peut pas être négative")
    .max(50, "Expérience maximum 50 ans")
    .required("Années d'expérience requises"),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (minuscules)
  status: yup
    .string()
    .oneOf(["active", "inactive"], "Statut invalide")
    .required("Statut requis"),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (minuscules)
  certificationLevel: yup
    .string()
    .oneOf(
      ["beginner", "intermediate", "expert"],
      "Niveau de certification invalide"
    )
    .required("Niveau de certification requis"),
  specialization: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(
          ["rice", "maize", "peanut", "sorghum", "cowpea", "millet", "wheat"],
          "Spécialisation invalide"
        )
    )
    .min(1, "Au moins une spécialisation requise")
    .required("Spécialisations requises"),
  phone: yup
    .string()
    .matches(/^[+]?[0-9\s-()]+$/, "Numéro de téléphone invalide")
    .optional(),
  email: yup.string().email("Email invalide").optional(),
});

// ✅ AJOUTÉ: Validation pour parcel avec valeurs UI
export const parcelValidationSchema = yup.object({
  name: yup.string().max(100, "Nom trop long").optional(),
  area: yup
    .number()
    .positive("La superficie doit être positive")
    .min(0.1, "Superficie minimum 0.1 hectare")
    .max(1000, "Superficie maximum 1000 hectares")
    .required("Superficie requise"),
  latitude: yup
    .number()
    .min(-90, "Latitude invalide")
    .max(90, "Latitude invalide")
    .required("Latitude requise"),
  longitude: yup
    .number()
    .min(-180, "Longitude invalide")
    .max(180, "Longitude invalide")
    .required("Longitude requise"),
  status: yup
    .string()
    .oneOf(["available", "in-use", "resting"], "Statut invalide")
    .required("Statut requis"),
  soilType: yup.string().max(100, "Type de sol trop long").optional(),
  irrigationSystem: yup
    .string()
    .max(100, "Système d'irrigation trop long")
    .optional(),
  address: yup.string().max(255, "Adresse trop longue").optional(),
  multiplierId: yup.number().positive().optional(),
});

// ✅ AJOUTÉ: Validation pour production avec valeurs UI
export const productionValidationSchema = yup.object({
  lotId: yup.string().required("Lot requis"),
  startDate: yup
    .string()
    .required("Date de début requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    }),
  endDate: yup
    .string()
    .optional()
    .test("valid-date", "Date invalide", (value) => {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    })
    .test(
      "after-start",
      "Date de fin doit être après le début",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) > new Date(startDate);
      }
    ),
  sowingDate: yup
    .string()
    .required("Date de semis requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    }),
  harvestDate: yup
    .string()
    .optional()
    .test("valid-date", "Date invalide", (value) => {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    })
    .test(
      "after-sowing",
      "Date de récolte doit être après le semis",
      function (value) {
        const { sowingDate } = this.parent;
        if (!value || !sowingDate) return true;
        return new Date(value) > new Date(sowingDate);
      }
    ),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (kebab-case)
  status: yup
    .string()
    .oneOf(
      ["planned", "in-progress", "completed", "cancelled"],
      "Statut invalide"
    )
    .required("Statut requis"),
  multiplierId: yup.number().positive().required("Multiplicateur requis"),
  parcelId: yup.number().positive().required("Parcelle requise"),
  plannedQuantity: yup
    .number()
    .positive("Quantité planifiée doit être positive")
    .optional(),
  actualYield: yup
    .number()
    .positive("Rendement réel doit être positif")
    .optional(),
  notes: yup.string().max(1000, "Notes trop longues").optional(),
  weatherConditions: yup
    .string()
    .max(500, "Conditions météo trop longues")
    .optional(),
});

// ✅ AJOUTÉ: Validation pour user avec valeurs UI
export const userValidationSchema = yup.object({
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court")
    .max(100, "Nom trop long"),
  email: yup.string().email("Email invalide").required("Email requis"),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (minuscules)
  role: yup
    .string()
    .oneOf(
      [
        "admin",
        "manager",
        "researcher",
        "technician",
        "inspector",
        "multiplier",
        "guest",
      ],
      "Rôle invalide"
    )
    .required("Rôle requis"),
  password: yup
    .string()
    .min(6, "Mot de passe trop court (minimum 6 caractères)")
    .required("Mot de passe requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("Confirmation du mot de passe requise"),
});

// ✅ AJOUTÉ: Validation pour contract avec valeurs UI
export const contractValidationSchema = yup.object({
  multiplierId: yup.number().positive().required("Multiplicateur requis"),
  varietyId: yup.number().positive().required("Variété requise"),
  startDate: yup
    .string()
    .required("Date de début requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    }),
  endDate: yup
    .string()
    .required("Date de fin requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    })
    .test(
      "after-start",
      "Date de fin doit être après le début",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) > new Date(startDate);
      }
    ),
  seedLevel: yup
    .string()
    .oneOf(
      ["GO", "G1", "G2", "G3", "G4", "R1", "R2"],
      "Niveau de semence invalide"
    )
    .required("Niveau de semence requis"),
  expectedQuantity: yup
    .number()
    .positive("Quantité attendue doit être positive")
    .min(1, "Quantité minimum 1 kg")
    .required("Quantité attendue requise"),
  actualQuantity: yup
    .number()
    .positive("Quantité réelle doit être positive")
    .optional(),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (kebab-case)
  status: yup
    .string()
    .oneOf(["draft", "active", "completed", "cancelled"], "Statut invalide")
    .required("Statut requis"),
  parcelId: yup.number().positive().optional(),
  paymentTerms: yup
    .string()
    .max(500, "Conditions de paiement trop longues")
    .optional(),
  notes: yup.string().max(1000, "Notes trop longues").optional(),
});

// ✅ AJOUTÉ: Validation pour productionActivity avec valeurs UI
export const productionActivityValidationSchema = yup.object({
  productionId: yup.number().positive().required("Production requise"),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (kebab-case)
  type: yup
    .string()
    .oneOf(
      [
        "soil-preparation",
        "sowing",
        "fertilization",
        "irrigation",
        "weeding",
        "pest-control",
        "harvest",
        "other",
      ],
      "Type d'activité invalide"
    )
    .required("Type d'activité requis"),
  activityDate: yup
    .string()
    .required("Date d'activité requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    }),
  description: yup
    .string()
    .required("Description requise")
    .min(5, "Description trop courte")
    .max(500, "Description trop longue"),
  personnel: yup
    .array()
    .of(yup.string().min(2, "Nom trop court"))
    .min(1, "Au moins une personne requise")
    .required("Personnel requis"),
  notes: yup.string().max(1000, "Notes trop longues").optional(),
});

// ✅ AJOUTÉ: Validation pour productionIssue avec valeurs UI
export const productionIssueValidationSchema = yup.object({
  productionId: yup.number().positive().required("Production requise"),
  issueDate: yup
    .string()
    .required("Date du problème requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    }),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (minuscules)
  type: yup
    .string()
    .oneOf(
      ["disease", "pest", "weather", "management", "other"],
      "Type de problème invalide"
    )
    .required("Type de problème requis"),
  description: yup
    .string()
    .required("Description requise")
    .min(5, "Description trop courte")
    .max(500, "Description trop longue"),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (minuscules)
  severity: yup
    .string()
    .oneOf(["low", "medium", "high"], "Niveau de sévérité invalide")
    .required("Niveau de sévérité requis"),
  actions: yup
    .string()
    .required("Actions requises")
    .min(5, "Actions trop courtes")
    .max(500, "Actions trop longues"),
  resolved: yup.boolean().required("Statut de résolution requis"),
  resolvedDate: yup
    .string()
    .optional()
    .test("valid-date", "Date invalide", (value) => {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    })
    .test(
      "after-issue",
      "Date de résolution doit être après le problème",
      function (value) {
        const { issueDate } = this.parent;
        if (!value || !issueDate) return true;
        return new Date(value) >= new Date(issueDate);
      }
    ),
  cost: yup.number().min(0, "Coût ne peut pas être négatif").optional(),
});

// ✅ AJOUTÉ: Validation pour soilAnalysis
export const soilAnalysisValidationSchema = yup.object({
  parcelId: yup.number().positive().required("Parcelle requise"),
  analysisDate: yup
    .string()
    .required("Date d'analyse requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    })
    .test("not-future", "Date ne peut pas être dans le futur", (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }),
  pH: yup.number().min(0, "pH minimum 0").max(14, "pH maximum 14").optional(),
  organicMatter: yup
    .number()
    .min(0, "Matière organique minimum 0%")
    .max(100, "Matière organique maximum 100%")
    .optional(),
  nitrogen: yup.number().min(0, "Azote minimum 0").optional(),
  phosphorus: yup.number().min(0, "Phosphore minimum 0").optional(),
  potassium: yup.number().min(0, "Potassium minimum 0").optional(),
  notes: yup.string().max(1000, "Notes trop longues").optional(),
});

// ✅ AJOUTÉ: Validation pour report avec valeurs UI
export const reportValidationSchema = yup.object({
  title: yup
    .string()
    .required("Titre requis")
    .min(5, "Titre trop court")
    .max(200, "Titre trop long"),
  // ✅ CORRIGÉ: Utiliser les valeurs UI (kebab-case)
  type: yup
    .string()
    .oneOf(
      [
        "production",
        "quality",
        "inventory",
        "multiplier-performance",
        "custom",
      ],
      "Type de rapport invalide"
    )
    .required("Type de rapport requis"),
  startDate: yup
    .string()
    .required("Date de début requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    }),
  endDate: yup
    .string()
    .required("Date de fin requise")
    .test("valid-date", "Date invalide", (value) => {
      return value ? !isNaN(Date.parse(value)) : false;
    })
    .test(
      "after-start",
      "Date de fin doit être après le début",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) >= new Date(startDate);
      }
    ),
  description: yup.string().max(1000, "Description trop longue").optional(),
  parameters: yup.object().optional(),
});

// ✅ AJOUTÉ: Fonctions utilitaires de validation

/**
 * Valide une coordonnée géographique
 */
export const validateCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Valide qu'une date n'est pas dans le futur
 */
export const validateNotFutureDate = (date: string): boolean => {
  if (!date) return true;
  return new Date(date) <= new Date();
};

/**
 * Valide qu'une date A est après une date B
 */
export const validateDateAfter = (dateA: string, dateB: string): boolean => {
  if (!dateA || !dateB) return true;
  return new Date(dateA) > new Date(dateB);
};

/**
 * Valide un numéro de téléphone
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true;
  return /^[+]?[0-9\s-()]+$/.test(phone);
};

/**
 * Valide une adresse email
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return true;
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
};

/**
 * Valide qu'un pourcentage est entre 0 et 100
 */
export const validatePercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};

/**
 * Valide qu'une quantité est positive
 */
export const validatePositiveNumber = (value: number): boolean => {
  return value > 0;
};

// ✅ AJOUTÉ: Schémas de validation par étapes pour les formulaires complexes

/**
 * Validation étape 1 : Informations de base pour seedLot
 */
export const seedLotBasicValidationSchema = yup.object({
  varietyId: yup.number().required("Variété requise").positive("ID invalide"),
  level: yup
    .string()
    .oneOf(["GO", "G1", "G2", "G3", "G4", "R1", "R2"], "Niveau invalide")
    .required("Niveau requis"),
  quantity: yup
    .number()
    .positive("La quantité doit être positive")
    .min(1, "Quantité minimum 1 kg")
    .required("Quantité requise"),
});

/**
 * Validation étape 2 : Informations de production pour seedLot
 */
export const seedLotProductionValidationSchema = yup.object({
  productionDate: yup
    .string()
    .required("Date de production requise")
    .test(
      "not-future",
      "La date ne peut pas être dans le futur",
      validateNotFutureDate
    ),
  multiplierId: yup.number().positive().optional(),
  parentLotId: yup.string().optional(),
});

/**
 * Validation étape 3 : Informations complémentaires pour seedLot
 */
export const seedLotAdditionalValidationSchema = yup.object({
  expiryDate: yup
    .string()
    .optional()
    .test("valid-date", "Date d'expiration invalide", (value) => {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    }),
  notes: yup.string().max(1000, "Notes trop longues").optional(),
  batchNumber: yup.string().max(50, "Numéro de lot trop long").optional(),
});

// Export des schémas combinés pour les formulaires multi-étapes
export const seedLotMultiStepValidationSchemas = {
  step1: seedLotBasicValidationSchema,
  step2: seedLotProductionValidationSchema,
  step3: seedLotAdditionalValidationSchema,
  complete: seedLotValidationSchema,
};

// ✅ AJOUTÉ: Validation pour l'authentification
export const loginValidationSchema = yup.object({
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup
    .string()
    .min(5, "Mot de passe trop court (minimum 5 caractères)")
    .required("Mot de passe requis"),
});

export const registerValidationSchema = yup.object({
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court")
    .max(100, "Nom trop long"),
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup
    .string()
    .min(6, "Mot de passe trop court (minimum 6 caractères)")
    .required("Mot de passe requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("Confirmation du mot de passe requise"),
  role: yup
    .string()
    .oneOf(
      [
        "admin",
        "manager",
        "researcher",
        "technician",
        "inspector",
        "multiplier",
        "guest",
      ],
      "Rôle invalide"
    )
    .required("Rôle requis"),
});

// ✅ AJOUTÉ: Validation pour les paramètres de recherche
export const searchValidationSchema = yup.object({
  query: yup
    .string()
    .min(2, "Recherche trop courte (minimum 2 caractères)")
    .max(100, "Recherche trop longue")
    .optional(),
  page: yup
    .number()
    .positive("Numéro de page invalide")
    .min(1, "Numéro de page minimum 1")
    .optional(),
  pageSize: yup
    .number()
    .positive("Taille de page invalide")
    .min(1, "Taille de page minimum 1")
    .max(100, "Taille de page maximum 100")
    .optional(),
  sortBy: yup.string().optional(),
  sortOrder: yup
    .string()
    .oneOf(["asc", "desc"], "Ordre de tri invalide")
    .optional(),
});

// ✅ AJOUTÉ: Validation pour les filtres
export const filterValidationSchema = yup.object({
  status: yup.string().optional(),
  level: yup.string().optional(),
  cropType: yup.string().optional(),
  startDate: yup
    .string()
    .optional()
    .test("valid-date", "Date de début invalide", (value) => {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    }),
  endDate: yup
    .string()
    .optional()
    .test("valid-date", "Date de fin invalide", (value) => {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    })
    .test(
      "after-start",
      "Date de fin doit être après le début",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) >= new Date(startDate);
      }
    ),
});

// ✅ AJOUTÉ: Validation pour les paramètres d'export
export const exportValidationSchema = yup.object({
  format: yup
    .string()
    .oneOf(["csv", "xlsx", "pdf", "json"], "Format d'export invalide")
    .required("Format d'export requis"),
  entities: yup
    .array()
    .of(yup.string())
    .min(1, "Au moins une entité à exporter")
    .required("Entités à exporter requises"),
  includeRelations: yup.boolean().optional(),
  dateRange: yup
    .object({
      start: yup.string().optional(),
      end: yup.string().optional(),
    })
    .optional(),
});

// ✅ AJOUTÉ: Validation pour les paramètres de configuration
export const settingsValidationSchema = yup.object({
  language: yup
    .string()
    .oneOf(["fr", "en", "wo"], "Langue invalide")
    .required("Langue requise"),
  timezone: yup.string().required("Fuseau horaire requis"),
  dateFormat: yup
    .string()
    .oneOf(
      ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
      "Format de date invalide"
    )
    .required("Format de date requis"),
  currency: yup
    .string()
    .oneOf(["XOF", "EUR", "USD"], "Devise invalide")
    .required("Devise requise"),
  notifications: yup
    .object({
      email: yup.boolean().required(),
      push: yup.boolean().required(),
      sms: yup.boolean().required(),
    })
    .required(),
});

// ✅ AJOUTÉ: Validation pour les commentaires et notes
export const commentValidationSchema = yup.object({
  content: yup
    .string()
    .required("Contenu requis")
    .min(5, "Commentaire trop court")
    .max(2000, "Commentaire trop long"),
  entityType: yup
    .string()
    .oneOf(
      ["seedLot", "variety", "multiplier", "production", "qualityControl"],
      "Type d'entité invalide"
    )
    .required("Type d'entité requis"),
  entityId: yup.string().required("ID d'entité requis"),
  isPrivate: yup.boolean().optional(),
});

// ✅ AJOUTÉ: Validation pour les fichiers uploadés
export const fileUploadValidationSchema = yup.object({
  file: yup
    .mixed()
    .required("Fichier requis")
    .test("fileSize", "Fichier trop volumineux (max 10MB)", (value: any) => {
      if (!value) return false;
      return value.size <= 10 * 1024 * 1024; // 10MB
    })
    .test("fileType", "Type de fichier non autorisé", (value: any) => {
      if (!value) return false;
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      return allowedTypes.includes(value.type);
    }),
  description: yup.string().max(500, "Description trop longue").optional(),
  category: yup
    .string()
    .oneOf(["document", "image", "report", "other"], "Catégorie invalide")
    .required("Catégorie requise"),
});

// ✅ AJOUTÉ: Validation pour les coordonnées GPS
export const coordinatesValidationSchema = yup.object({
  latitude: yup
    .number()
    .min(-90, "Latitude invalide (min -90)")
    .max(90, "Latitude invalide (max 90)")
    .required("Latitude requise"),
  longitude: yup
    .number()
    .min(-180, "Longitude invalide (min -180)")
    .max(180, "Longitude invalide (max 180)")
    .required("Longitude requise"),
  altitude: yup
    .number()
    .min(-500, "Altitude invalide (min -500m)")
    .max(9000, "Altitude invalide (max 9000m)")
    .optional(),
  accuracy: yup.number().positive("Précision doit être positive").optional(),
});

// Export par défaut de tous les schémas principaux
export default {
  seedLotValidationSchema,
  varietyValidationSchema,
  qualityControlValidationSchema,
  multiplierValidationSchema,
  parcelValidationSchema,
  productionValidationSchema,
  userValidationSchema,
  contractValidationSchema,
  productionActivityValidationSchema,
  productionIssueValidationSchema,
  soilAnalysisValidationSchema,
  reportValidationSchema,
  loginValidationSchema,
  registerValidationSchema,
  searchValidationSchema,
  filterValidationSchema,
  exportValidationSchema,
  settingsValidationSchema,
  commentValidationSchema,
  fileUploadValidationSchema,
  coordinatesValidationSchema,
};
