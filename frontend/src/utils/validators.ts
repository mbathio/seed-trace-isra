// ===== 2. CORRECTION: frontend/src/utils/validators.ts =====

import * as yup from "yup";

// ✅ CORRECTION: Fonctions de test qui retournent toujours boolean
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

// ✅ CORRECTION: Validation pour contrôle qualité
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
