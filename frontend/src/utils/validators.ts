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
  productionDate: yup
    .date()
    .required("Date de production requise")
    .max(new Date(), "La date ne peut pas être dans le futur"),
  expiryDate: yup
    .date()
    .min(
      yup.ref("productionDate"),
      "La date d'expiration doit être après la production"
    ),
  notes: yup.string().max(500, "Notes trop longues (max 500 caractères)"),
});

export const qualityControlValidationSchema = yup.object({
  lotId: yup.string().required("Lot requis"),
  controlDate: yup
    .date()
    .required("Date de contrôle requise")
    .max(new Date(), "La date ne peut pas être dans le futur"),
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
  moistureContent: yup.number().min(0, "Minimum 0%").max(100, "Maximum 100%"),
  seedHealth: yup.number().min(0, "Minimum 0%").max(100, "Maximum 100%"),
  observations: yup
    .string()
    .max(1000, "Observations trop longues (max 1000 caractères)"),
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
