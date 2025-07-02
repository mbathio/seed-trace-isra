// backend/src/services/EnumValidationService.ts
import { ENUM_MAPPINGS } from "../config/enumMappings";

export class EnumValidationService {
  // Valider une valeur d'enum (accepte UI ou DB)
  static isValidEnumValue(
    value: string,
    enumType: keyof typeof ENUM_MAPPINGS
  ): boolean {
    if (!value || !ENUM_MAPPINGS[enumType]) return false;

    const mapping = ENUM_MAPPINGS[enumType];
    // Cast explicite pour éviter l'erreur TypeScript
    const uiToDb = mapping.UI_TO_DB as Record<string, string>;
    const dbToUi = mapping.DB_TO_UI as Record<string, string>;

    return !!(uiToDb[value] || dbToUi[value]);
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

  // Transformer une valeur d'enum
  static transformValue(
    value: string | undefined,
    enumType: keyof typeof ENUM_MAPPINGS,
    direction: "UI_TO_DB" | "DB_TO_UI"
  ): string | undefined {
    if (!value || !ENUM_MAPPINGS[enumType]) return value;

    const mapping = ENUM_MAPPINGS[enumType];
    const transformMap =
      direction === "UI_TO_DB"
        ? (mapping.UI_TO_DB as Record<string, string>)
        : (mapping.DB_TO_UI as Record<string, string>);

    return transformMap[value] || value;
  }

  // Valider et transformer une valeur
  static validateAndTransform(
    value: string,
    enumType: keyof typeof ENUM_MAPPINGS,
    targetFormat: "UI" | "DB"
  ): {
    isValid: boolean;
    value: string | undefined;
    error?: string;
  } {
    if (!this.isValidEnumValue(value, enumType)) {
      return {
        isValid: false,
        value: undefined,
        error: `Valeur invalide pour ${enumType}: ${value}`,
      };
    }

    const direction = targetFormat === "DB" ? "UI_TO_DB" : "DB_TO_UI";
    const transformed = this.transformValue(value, enumType, direction);

    return {
      isValid: true,
      value: transformed,
    };
  }

  // Obtenir le format actuel d'une valeur (UI ou DB)
  static getValueFormat(
    value: string,
    enumType: keyof typeof ENUM_MAPPINGS
  ): "UI" | "DB" | "UNKNOWN" {
    if (!value || !ENUM_MAPPINGS[enumType]) return "UNKNOWN";

    const mapping = ENUM_MAPPINGS[enumType];
    const uiToDb = mapping.UI_TO_DB as Record<string, string>;
    const dbToUi = mapping.DB_TO_UI as Record<string, string>;

    if (uiToDb[value]) return "UI";
    if (dbToUi[value]) return "DB";
    return "UNKNOWN";
  }

  // Normaliser une valeur vers un format spécifique
  static normalize(
    value: string,
    enumType: keyof typeof ENUM_MAPPINGS,
    targetFormat: "UI" | "DB"
  ): string | undefined {
    const currentFormat = this.getValueFormat(value, enumType);

    if (currentFormat === "UNKNOWN") return undefined;
    if (currentFormat === targetFormat) return value;

    const direction = targetFormat === "DB" ? "UI_TO_DB" : "DB_TO_UI";
    return this.transformValue(value, enumType, direction);
  }

  // Valider un tableau de valeurs
  static validateArray(
    values: string[],
    enumType: keyof typeof ENUM_MAPPINGS
  ): {
    isValid: boolean;
    invalidValues: string[];
  } {
    const invalidValues = values.filter(
      (value) => !this.isValidEnumValue(value, enumType)
    );

    return {
      isValid: invalidValues.length === 0,
      invalidValues,
    };
  }

  // Transformer un tableau de valeurs
  static transformArray(
    values: string[],
    enumType: keyof typeof ENUM_MAPPINGS,
    direction: "UI_TO_DB" | "DB_TO_UI"
  ): string[] {
    return values.map(
      (value) => this.transformValue(value, enumType, direction) || value
    );
  }

  // Obtenir toutes les valeurs possibles (UI et DB)
  static getAllValidValues(enumType: keyof typeof ENUM_MAPPINGS): {
    ui: string[];
    db: string[];
  } {
    return {
      ui: this.getValidUIValues(enumType),
      db: this.getValidDBValues(enumType),
    };
  }

  // Créer un mapping inversé pour un type d'enum
  static getMapping(
    enumType: keyof typeof ENUM_MAPPINGS,
    direction: "UI_TO_DB" | "DB_TO_UI"
  ): Record<string, string> {
    const mapping = ENUM_MAPPINGS[enumType];
    if (!mapping) return {};

    return direction === "UI_TO_DB"
      ? (mapping.UI_TO_DB as Record<string, string>)
      : (mapping.DB_TO_UI as Record<string, string>);
  }

  // Valider la cohérence des mappings (utile pour les tests)
  static validateMappingConsistency(enumType: keyof typeof ENUM_MAPPINGS): {
    isConsistent: boolean;
    issues: string[];
  } {
    const mapping = ENUM_MAPPINGS[enumType];
    if (!mapping) {
      return { isConsistent: false, issues: [`Mapping ${enumType} not found`] };
    }

    const issues: string[] = [];
    const uiToDb = mapping.UI_TO_DB as Record<string, string>;
    const dbToUi = mapping.DB_TO_UI as Record<string, string>;

    // Vérifier que chaque valeur UI a une correspondance DB
    for (const [uiValue, dbValue] of Object.entries(uiToDb)) {
      if (!dbToUi[dbValue]) {
        issues.push(
          `UI value "${uiValue}" maps to DB value "${dbValue}" but reverse mapping is missing`
        );
      } else if (dbToUi[dbValue] !== uiValue) {
        issues.push(
          `Inconsistent mapping: UI "${uiValue}" -> DB "${dbValue}" -> UI "${dbToUi[dbValue]}"`
        );
      }
    }

    // Vérifier que chaque valeur DB a une correspondance UI
    for (const [dbValue, uiValue] of Object.entries(dbToUi)) {
      if (!uiToDb[uiValue]) {
        issues.push(
          `DB value "${dbValue}" maps to UI value "${uiValue}" but reverse mapping is missing`
        );
      }
    }

    return {
      isConsistent: issues.length === 0,
      issues,
    };
  }

  // Obtenir des suggestions pour une valeur invalide
  static getSuggestions(
    invalidValue: string,
    enumType: keyof typeof ENUM_MAPPINGS,
    maxSuggestions: number = 3
  ): string[] {
    const allValues = [
      ...this.getValidUIValues(enumType),
      ...this.getValidDBValues(enumType),
    ];

    // Simple algorithme de distance de Levenshtein pour trouver les valeurs similaires
    const suggestions = allValues
      .map((value) => ({
        value,
        distance: this.levenshteinDistance(
          invalidValue.toLowerCase(),
          value.toLowerCase()
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxSuggestions)
      .map((item) => item.value);

    return suggestions;
  }

  // Calcul de la distance de Levenshtein (pour les suggestions)
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
