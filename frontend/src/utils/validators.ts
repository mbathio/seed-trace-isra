// frontend/src/utils/validators.ts - VERSION CORRIGÉE
import * as yup from "yup";

// Schéma pour les lots de semences
export const seedLotValidationSchema = yup.object({
  varietyId: yup
    .mixed()
    .test("variety-required", "Variété requise", function (value) {
      return value !== null && value !== undefined && value !== "";
    }),
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
    .test("valid-date", "Date de production invalide", function (value) {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test(
      "not-future",
      "La date ne peut pas être dans le futur",
      function (value) {
        if (!value) return true;
        const date = new Date(value);
        return date <= new Date();
      }
    ),
  expiryDate: yup
    .string()
    .optional()
    .test("valid-date", "Date d'expiration invalide", function (value) {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test(
      "after-production",
      "Date d'expiration doit être après la production",
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
  batchNumber: yup.string().max(50, "Numéro de lot trop long").optional(),
  multiplierId: yup.number().positive().optional(),
  parentLotId: yup.string().optional(),
});

// Schéma pour les contrôles qualité
export const qualityControlValidationSchema = yup.object({
  lotId: yup.string().required("Lot requis"),
  controlDate: yup
    .string()
    .required("Date de contrôle requise")
    .test("valid-date", "Date invalide", function (value) {
      return value && !isNaN(Date.parse(value));
    })
    .test(
      "not-future",
      "Date ne peut pas être dans le futur",
      function (value) {
        if (!value) return true;
        return new Date(value) <= new Date();
      }
    ),
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

// Schéma pour les variétés
export const varietyValidationSchema = yup.object({
  code: yup
    .string()
    .required("Code requis")
    .min(2, "Code trop court")
    .max(20, "Code trop long")
    .matches(/^[A-Z0-9-_]+$/i, "Code invalide"),
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court")
    .max(100, "Nom trop long"),
  cropType: yup
    .string()
    .oneOf(
      ["rice", "maize", "peanut", "sorghum", "cowpea", "millet"],
      "Type invalide"
    )
    .required("Type de culture requis"),
  description: yup.string().max(1000, "Description trop longue").optional(),
  maturityDays: yup
    .number()
    .positive("Durée doit être positive")
    .min(30, "Minimum 30 jours")
    .max(365, "Maximum 365 jours")
    .integer("Durée doit être un entier")
    .required("Durée de maturation requise"),
  yieldPotential: yup
    .number()
    .positive("Potentiel doit être positif")
    .max(50, "Potentiel très élevé")
    .optional(),
  origin: yup.string().max(100, "Origine trop longue").optional(),
  releaseYear: yup
    .number()
    .min(1900, "Année trop ancienne")
    .max(new Date().getFullYear(), "Année future non autorisée")
    .integer("Année doit être un entier")
    .optional(),
});

// Schéma pour les multiplicateurs
export const multiplierValidationSchema = yup.object({
  name: yup
    .string()
    .required("Nom requis")
    .min(2, "Nom trop court")
    .max(100, "Nom trop long"),
  address: yup
    .string()
    .required("Adresse requise")
    .min(5, "Adresse trop courte")
    .max(200, "Adresse trop longue"),
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
    .max(50, "Expérience très élevée")
    .integer("Expérience doit être un entier")
    .required("Années d'expérience requises"),
  certificationLevel: yup
    .string()
    .oneOf(["beginner", "intermediate", "expert"], "Niveau invalide")
    .required("Niveau de certification requis"),
  specialization: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(["rice", "maize", "peanut", "sorghum", "cowpea", "millet"])
    )
    .min(1, "Au moins une spécialisation requise")
    .required("Spécialisations requises"),
  phone: yup
    .string()
    .matches(/^(\+221)?[0-9]{8,9}$/, "Numéro sénégalais invalide")
    .optional(),
  email: yup.string().email("Email invalide").optional(),
});

// Utilitaires de validation
export const ValidationUtils = {
  validateLotId: (lotId: string): boolean => {
    const regex = /^SL-(GO|G[1-4]|R[1-2])-\d{4}-\d{3}$/;
    return regex.test(lotId);
  },

  validateCoordinates: (lat: number, lng: number): boolean => {
    return (
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  },

  validateSenegalCoordinates: (lat: number, lng: number): boolean => {
    return lat >= 12.0 && lat <= 16.7 && lng >= -17.6 && lng <= -11.3;
  },

  validateEmail: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 100;
  },

  validatePhoneNumber: (phone: string): boolean => {
    const regex = /^(\+221)?[0-9]{8,9}$/;
    return regex.test(phone.replace(/\s+/g, ""));
  },

  sanitizeText: (text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[<>'"]/g, "");
  },
};
