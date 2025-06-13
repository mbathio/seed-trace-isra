// backend/src/services/ValidationService.ts - ✅ NOUVEAU: Service de validation centralisé
import {
  CreateSeedLotData,
  CreateQualityControlData,
  CreateMultiplierData,
} from "../types/entities";
import { ValidationUtils } from "../utils/validators";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationService {
  // ✅ CORRECTION: Validation centralisée pour les lots de semences
  static validateSeedLotData(data: CreateSeedLotData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation des champs obligatoires
    if (!data.varietyId) {
      errors.push("L'ID de la variété est requis");
    }

    if (!data.level || !ValidationUtils.isValidSeedLevel(data.level)) {
      errors.push("Le niveau de semence est invalide");
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push("La quantité doit être positive");
    }

    if (!data.productionDate) {
      errors.push("La date de production est requise");
    } else {
      const prodDate = new Date(data.productionDate);
      const now = new Date();

      if (prodDate > now) {
        errors.push("La date de production ne peut pas être dans le futur");
      }

      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      if (prodDate < twoYearsAgo) {
        warnings.push("Date de production très ancienne (plus de 2 ans)");
      }
    }

    // Validation de la date d'expiration
    if (data.expiryDate) {
      const expiryDate = new Date(data.expiryDate);
      const prodDate = new Date(data.productionDate);

      if (expiryDate <= prodDate) {
        errors.push(
          "La date d'expiration doit être postérieure à la date de production"
        );
      }

      if (expiryDate <= new Date()) {
        warnings.push("La date d'expiration est déjà passée");
      }
    }

    // Validation des quantités selon le niveau
    const levelLimits = {
      GO: { min: 10, max: 1000 },
      G1: { min: 100, max: 5000 },
      G2: { min: 500, max: 10000 },
      G3: { min: 1000, max: 20000 },
      G4: { min: 2000, max: 50000 },
      R1: { min: 5000, max: 100000 },
      R2: { min: 10000, max: 500000 },
    };

    const limits = levelLimits[data.level as keyof typeof levelLimits];
    if (limits && data.quantity) {
      if (data.quantity < limits.min) {
        warnings.push(
          `Quantité faible pour un lot ${data.level} (minimum recommandé: ${limits.min}kg)`
        );
      }
      if (data.quantity > limits.max) {
        warnings.push(
          `Quantité élevée pour un lot ${data.level} (maximum recommandé: ${limits.max}kg)`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ✅ CORRECTION: Validation pour les contrôles qualité
  static validateQualityControlData(
    data: CreateQualityControlData
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation des champs obligatoires
    if (!data.lotId) {
      errors.push("L'ID du lot est requis");
    }

    if (!data.controlDate) {
      errors.push("La date de contrôle est requise");
    } else {
      const controlDate = new Date(data.controlDate);
      const now = new Date();

      if (controlDate > now) {
        errors.push("La date de contrôle ne peut pas être dans le futur");
      }
    }

    // Validation des taux (0-100%)
    const rateFields = [
      { field: "germinationRate", name: "Taux de germination" },
      { field: "varietyPurity", name: "Pureté variétale" },
      { field: "moistureContent", name: "Taux d'humidité" },
      { field: "seedHealth", name: "Santé des graines" },
    ];

    rateFields.forEach(({ field, name }) => {
      const value = data[field as keyof CreateQualityControlData] as number;
      if (value !== undefined) {
        if (value < 0 || value > 100) {
          errors.push(`${name} doit être entre 0 et 100%`);
        }
      }
    });

    // Validation spécifique selon les normes
    if (data.germinationRate !== undefined) {
      if (data.germinationRate < 80) {
        warnings.push("Taux de germination faible (< 80%)");
      }
      if (data.germinationRate < 60) {
        errors.push(
          "Taux de germination trop faible (< 60%) - lot non certifiable"
        );
      }
    }

    if (data.varietyPurity !== undefined) {
      if (data.varietyPurity < 95) {
        warnings.push("Pureté variétale faible (< 95%)");
      }
      if (data.varietyPurity < 90) {
        errors.push(
          "Pureté variétale trop faible (< 90%) - lot non certifiable"
        );
      }
    }

    if (data.moistureContent !== undefined) {
      if (data.moistureContent > 14) {
        warnings.push("Taux d'humidité élevé (> 14%) - risque de conservation");
      }
      if (data.moistureContent > 18) {
        errors.push(
          "Taux d'humidité trop élevé (> 18%) - conservation impossible"
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ✅ CORRECTION: Validation pour les multiplicateurs
  static validateMultiplierData(data: CreateMultiplierData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation des champs obligatoires
    if (!data.name || data.name.trim().length < 2) {
      errors.push("Le nom doit contenir au moins 2 caractères");
    }

    if (!data.address || data.address.trim().length < 5) {
      errors.push("L'adresse doit contenir au moins 5 caractères");
    }

    // Validation des coordonnées
    if (!ValidationUtils.isValidCoordinates(data.latitude, data.longitude)) {
      errors.push("Coordonnées GPS invalides");
    }

    // Validation spécifique au Sénégal
    const senegalBounds = {
      latMin: 12.0,
      latMax: 16.7,
      lngMin: -17.6,
      lngMax: -11.3,
    };

    if (
      data.latitude < senegalBounds.latMin ||
      data.latitude > senegalBounds.latMax ||
      data.longitude < senegalBounds.lngMin ||
      data.longitude > senegalBounds.lngMax
    ) {
      warnings.push("Coordonnées en dehors du Sénégal");
    }

    // Validation de l'expérience
    if (data.yearsExperience < 0) {
      errors.push("L'expérience ne peut pas être négative");
    }
    if (data.yearsExperience > 50) {
      warnings.push("Expérience très élevée (> 50 ans)");
    }
    if (data.yearsExperience < 2) {
      warnings.push("Expérience faible (< 2 ans)");
    }

    // Validation du niveau de certification vs expérience
    const certificationLevels = {
      BEGINNER: { minExp: 0, maxExp: 3 },
      INTERMEDIATE: { minExp: 2, maxExp: 10 },
      EXPERT: { minExp: 5, maxExp: Infinity },
    };

    const level =
      certificationLevels[
        data.certificationLevel as keyof typeof certificationLevels
      ];
    if (level) {
      if (data.yearsExperience < level.minExp) {
        warnings.push(
          `Expérience faible pour le niveau ${data.certificationLevel}`
        );
      }
      if (data.yearsExperience > level.maxExp) {
        warnings.push(
          `Expérience élevée pour le niveau ${data.certificationLevel}`
        );
      }
    }

    // Validation du téléphone
    if (data.phone && !ValidationUtils.isValidPhoneNumber(data.phone)) {
      errors.push("Numéro de téléphone invalide");
    }

    // Validation de l'email
    if (data.email && !ValidationUtils.isValidEmail(data.email)) {
      errors.push("Adresse email invalide");
    }

    // Validation des spécialisations
    if (!data.specialization || data.specialization.length === 0) {
      warnings.push("Aucune spécialisation définie");
    }

    const validCrops = [
      "RICE",
      "MAIZE",
      "PEANUT",
      "SORGHUM",
      "COWPEA",
      "MILLET",
      "WHEAT",
    ];
    const invalidSpecs = data.specialization?.filter(
      (spec) => !validCrops.includes(spec)
    );
    if (invalidSpecs && invalidSpecs.length > 0) {
      errors.push(`Spécialisations invalides: ${invalidSpecs.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ✅ CORRECTION: Validation des hiérarchies de lots
  static validateLotHierarchy(
    parentLevel: string,
    childLevel: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
    const parentIndex = levelHierarchy.indexOf(parentLevel);
    const childIndex = levelHierarchy.indexOf(childLevel);

    if (parentIndex === -1 || childIndex === -1) {
      errors.push("Niveaux de semence invalides");
      return { isValid: false, errors, warnings };
    }

    if (parentIndex >= childIndex) {
      errors.push(
        `Un lot ${childLevel} ne peut pas être créé à partir d'un lot ${parentLevel}`
      );
    }

    // Vérifier les sauts de génération
    if (childIndex - parentIndex > 1) {
      warnings.push(
        `Saut de génération détecté: ${parentLevel} → ${childLevel}`
      );
    }

    // Règles spécifiques
    if (parentLevel === "GO" && childLevel !== "G1") {
      warnings.push("Un lot GO devrait normalement produire un lot G1");
    }

    if (parentLevel.startsWith("G") && childLevel.startsWith("R")) {
      // Transition de generation vers reproduction - acceptable
    } else if (parentLevel.startsWith("R") && childLevel.startsWith("G")) {
      errors.push(
        "Un lot de reproduction ne peut pas produire un lot de génération"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ✅ CORRECTION: Validation croisée avec base de données
  static async validateWithDatabase(
    data: any,
    type: "seedlot" | "multiplier" | "quality"
  ): Promise<ValidationResult> {
    // Cette méthode peut être étendue pour faire des validations
    // qui nécessitent des requêtes à la base de données
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  }

  // ✅ CORRECTION: Validation des données d'upload
  static validateFileUpload(
    file: Express.Multer.File,
    allowedTypes: string[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!file) {
      errors.push("Aucun fichier fourni");
      return { isValid: false, errors, warnings };
    }

    // Vérifier le type de fichier
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      errors.push(
        `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(
          ", "
        )}`
      );
    }

    // Vérifier la taille
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push("Fichier trop volumineux (maximum 10MB)");
    }

    // Vérifier le nom de fichier
    if (file.originalname.length > 255) {
      errors.push("Nom de fichier trop long");
    }

    // Caractères spéciaux dangereux
    const dangerousChars = /[<>:"/\\|?*]/;
    if (dangerousChars.test(file.originalname)) {
      errors.push("Le nom de fichier contient des caractères non autorisés");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
