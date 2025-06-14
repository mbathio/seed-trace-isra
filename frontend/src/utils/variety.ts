// frontend/src/utils/validators/variety.ts - Schéma de validation spécifique pour les variétés
import * as yup from "yup";

// Interface pour le formulaire de création de variété
export interface CreateVarietyFormData {
  code: string;
  name: string;
  cropType:
    | "rice"
    | "maize"
    | "peanut"
    | "sorghum"
    | "cowpea"
    | "millet"
    | "wheat";
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances?: string[];
  origin?: string;
  releaseYear?: number;
}

// Schéma de validation pour la création de variété
export const createVarietyValidationSchema = yup
  .object<CreateVarietyFormData>({
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
      .oneOf(
        ["rice", "maize", "peanut", "sorghum", "cowpea", "millet", "wheat"],
        "Type de culture invalide"
      )
      .required("Type de culture requis") as yup.Schema<
      "rice" | "maize" | "peanut" | "sorghum" | "cowpea" | "millet" | "wheat"
    >,
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
    resistances: yup.array().of(yup.string().required()).optional(),
  })
  .required();

// Schéma de validation pour la mise à jour de variété
export const updateVarietyValidationSchema =
  createVarietyValidationSchema.partial();
