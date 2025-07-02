import { ENUM_MAPPINGS } from "../config/enumMappings";

export class EnumValidationService {
  // Valider une valeur d'enum (accepte UI ou DB)
  static isValidEnumValue(
    value: string,
    enumType: keyof typeof ENUM_MAPPINGS
  ): boolean {
    if (!value || !ENUM_MAPPINGS[enumType]) return false;

    const mapping = ENUM_MAPPINGS[enumType];
    return !!(mapping.UI_TO_DB[value] || mapping.DB_TO_UI[value]);
  }

  // Obtenir toutes les valeurs valides pour un enum (UI)
  static getValidUIValues(enumType: keyof typeof ENUM_MAPPINGS): string[] {
    const mapping = ENUM_MAPPINGS[enumType];
    if (!mapping) return [];
    return Object.keys(mapping.UI_TO_DB);
  }

  // Obtenir toutes les valeurs valides pour un enum (DB)
  static getValidDBValues(enumType: keyof typeof ENUM_MAPPINGS): string[] {
    const mapping = ENUM_MAPPINGS[enumType];
    if (!mapping) return [];
    return Object.keys(mapping.DB_TO_UI);
  }

  // Valider un objet complet
  static validateObject(
    data: any,
    schema: Record<string, keyof typeof ENUM_MAPPINGS>
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const [field, enumType] of Object.entries(schema)) {
      if (data[field] && !this.isValidEnumValue(data[field], enumType)) {
        errors.push(`Valeur invalide pour ${field}: ${data[field]}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
