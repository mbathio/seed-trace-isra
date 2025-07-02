import { z } from "zod";
import { EnumValidationService } from "../services/EnumValidationService";

// Exemple pour seed-lot
export const createSeedLotSchema = z.object({
  varietyId: z.union([z.string(), z.number()]),
  level: z
    .string()
    .refine(
      (val) => EnumValidationService.isValidEnumValue(val, "SEED_LEVEL"),
      { message: "Niveau de semence invalide" }
    ),
  quantity: z.number().positive(),
  productionDate: z.string(),
  status: z
    .string()
    .refine(
      (val) => EnumValidationService.isValidEnumValue(val, "LOT_STATUS"),
      { message: "Statut invalide" }
    )
    .optional(),
  // ... autres champs
});

// Exemple pour variety
export const createVarietySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  cropType: z
    .string()
    .refine((val) => EnumValidationService.isValidEnumValue(val, "CROP_TYPE"), {
      message: "Type de culture invalide",
    }),
  // ... autres champs
});
