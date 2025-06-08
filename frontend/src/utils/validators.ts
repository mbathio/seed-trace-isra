import * as yup from "yup";

export const seedLotValidationSchema = yup.object({
  varietyId: yup.number().required("Variété requise"),
  level: yup
    .string()
    .oneOf(["GO", "G1", "G2", "G3", "G4", "R1", "R2"])
    .required("Niveau requis"),
  quantity: yup
    .number()
    .positive("La quantité doit être positive")
    .required("Quantité requise"),
  productionDate: yup.string().required("Date de production requise"),
  expiryDate: yup
    .string()
    .optional()
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
  notes: yup.string().max(500, "Notes trop longues (max 500 caractères)"),
  batchNumber: yup.string().optional(),
  multiplierId: yup.number().optional(),
  parentLotId: yup.string().optional(),
});

export const qualityControlValidationSchema = yup.object({
  lotId: yup.string().required("Lot requis"),
  controlDate: yup
    .string()
    .required("Date de contrôle requise")
    .test(
      "is-not-future",
      "La date ne peut pas être dans le futur",
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
    .optional()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%"),
  seedHealth: yup
    .number()
    .optional()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%"),
  observations: yup
    .string()
    .optional()
    .max(1000, "Observations trop longues (max 1000 caractères)"),
  testMethod: yup.string().optional(),
});

export const varietyValidationSchema = yup.object({
  code: yup
    .string()
    .required("Code requis")
    .matches(
      /^[A-Z0-9-]+$/,
      "Code invalide (majuscules, chiffres et tirets uniquement)"
    ),
  name: yup.string().required("Nom requis").min(2, "Nom trop court"),
  cropType: yup
    .string()
    .oneOf(["RICE", "MAIZE", "PEANUT", "SORGHUM", "COWPEA", "MILLET"])
    .required("Type de culture requis"),
  maturityDays: yup
    .number()
    .positive("Durée de maturation positive requise")
    .required("Durée de maturation requise"),
  yieldPotential: yup.number().positive("Potentiel de rendement positif"),
  releaseYear: yup
    .number()
    .min(1900, "Année trop ancienne")
    .max(new Date().getFullYear(), "Année future non autorisée"),
});

export const multiplierValidationSchema = yup.object({
  name: yup.string().required("Nom requis").min(2, "Nom trop court"),
  address: yup.string().required("Adresse requise"),
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
    .required("Années d'expérience requises"),
  certificationLevel: yup
    .string()
    .oneOf(["BEGINNER", "INTERMEDIATE", "EXPERT"])
    .required("Niveau de certification requis"),
  specialization: yup
    .array()
    .of(yup.string())
    .min(1, "Au moins une spécialisation requise")
    .required("Spécialisations requises"),
  phone: yup.string().optional(),
  email: yup.string().email("Email invalide").optional(),
});
