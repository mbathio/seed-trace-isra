// backend/src/utils/validatiors.ts - CORRIGÉ COMPLET sans erreurs TypeScript

// ✅ CORRECTION: Import conditionnel de yup pour éviter l'erreur
let yup: any;
try {
  yup = require("yup");
} catch (error) {
  // yup n'est pas installé, utiliser seulement ValidationUtils
  console.warn("yup module not found, using ValidationUtils only");
}

// ✅ CORRECTION: Ajouter la classe ValidationUtils manquante
export class ValidationUtils {
  // Validation des emails
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
  }

  // Validation des URLs
  static isValidURL(url: string): boolean {
    if (!url || typeof url !== "string") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validation des coordonnées GPS
  static isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  // Validation des numéros de téléphone sénégalais
  static isValidPhoneNumber(phone: string): boolean {
    if (!phone || typeof phone !== "string") return false;
    // Format sénégalais: +221XXXXXXXX ou 77XXXXXXX, 78XXXXXXX, 70XXXXXXX, etc.
    const phoneRegex = /^(\+221)?[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  }

  // Validation des niveaux de semences
  static isValidSeedLevel(level: string): boolean {
    const validLevels = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
    return validLevels.includes(level);
  }

  // Parse sécurisé d'entiers
  static safeParseInt(
    value: string | number | undefined,
    defaultValue: number
  ): number {
    if (value === undefined || value === null) return defaultValue;

    if (typeof value === "number") {
      return isNaN(value) ? defaultValue : Math.floor(value);
    }

    if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
  }

  // Parse sécurisé de floats
  static safeParseFloat(
    value: string | number | undefined,
    defaultValue: number
  ): number {
    if (value === undefined || value === null) return defaultValue;

    if (typeof value === "number") {
      return isNaN(value) ? defaultValue : value;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    return defaultValue;
  }

  // Validation des dates
  static isValidDate(dateString: string): boolean {
    if (!dateString || typeof dateString !== "string") return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Validation des dates dans le futur
  static isDateInFuture(dateString: string): boolean {
    if (!this.isValidDate(dateString)) return false;
    return new Date(dateString) > new Date();
  }

  // Validation des dates dans le passé
  static isDateInPast(dateString: string): boolean {
    if (!this.isValidDate(dateString)) return false;
    return new Date(dateString) < new Date();
  }

  // Validation de plage de dates
  static isValidDateRange(startDate: string, endDate: string): boolean {
    if (!this.isValidDate(startDate) || !this.isValidDate(endDate))
      return false;
    return new Date(startDate) <= new Date(endDate);
  }

  // Nettoyage et validation de strings
  static sanitizeString(input: string, maxLength: number = 255): string {
    if (!input || typeof input !== "string") return "";
    return input.trim().substring(0, maxLength);
  }

  // Validation des pourcentages
  static isValidPercentage(value: number): boolean {
    return (
      typeof value === "number" && !isNaN(value) && value >= 0 && value <= 100
    );
  }

  // Validation des quantités
  static isValidQuantity(
    quantity: number,
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER
  ): boolean {
    return (
      typeof quantity === "number" &&
      !isNaN(quantity) &&
      quantity >= min &&
      quantity <= max &&
      quantity > 0
    );
  }

  // Validation des codes de variétés
  static isValidVarietyCode(code: string): boolean {
    if (!code || typeof code !== "string") return false;
    // Format: lettres, chiffres, tirets, underscores
    const codeRegex = /^[A-Za-z0-9_-]{2,20}$/;
    return codeRegex.test(code);
  }

  // Validation des IDs de lots
  static isValidLotId(lotId: string): boolean {
    if (!lotId || typeof lotId !== "string") return false;
    // Format: SL-LEVEL-YEAR-NUMBER (ex: SL-G1-2024-001)
    const lotIdRegex = /^SL-(GO|G[1-4]|R[1-2])-\d{4}-\d{3}$/;
    return lotIdRegex.test(lotId);
  }

  // Validation de la hiérarchie des lots
  static isValidLotHierarchy(parentLevel: string, childLevel: string): boolean {
    const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
    const parentIndex = levelHierarchy.indexOf(parentLevel);
    const childIndex = levelHierarchy.indexOf(childLevel);

    if (parentIndex === -1 || childIndex === -1) return false;
    return parentIndex < childIndex;
  }

  // Validation des extensions de fichiers
  static isValidFileExtension(
    filename: string,
    allowedExtensions: string[]
  ): boolean {
    if (!filename || typeof filename !== "string") return false;
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  // Validation de la taille de fichier
  static isValidFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
  }

  // Validation des coordonnées spécifiques au Sénégal
  static isValidSenegalCoordinates(
    latitude: number,
    longitude: number
  ): boolean {
    const senegalBounds = {
      latMin: 12.0,
      latMax: 16.7,
      lngMin: -17.6,
      lngMax: -11.3,
    };

    return (
      this.isValidCoordinates(latitude, longitude) &&
      latitude >= senegalBounds.latMin &&
      latitude <= senegalBounds.latMax &&
      longitude >= senegalBounds.lngMin &&
      longitude <= senegalBounds.lngMax
    );
  }

  // Validation des noms (personnes, lieux, etc.)
  static isValidName(
    name: string,
    minLength: number = 2,
    maxLength: number = 100
  ): boolean {
    if (!name || typeof name !== "string") return false;
    const trimmedName = name.trim();
    return (
      trimmedName.length >= minLength &&
      trimmedName.length <= maxLength &&
      /^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)
    );
  }

  // Validation des mots de passe
  static isValidPassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!password || typeof password !== "string") {
      errors.push("Mot de passe requis");
      return { isValid: false, errors };
    }

    if (password.length < 6) {
      errors.push("Mot de passe doit contenir au moins 6 caractères");
    }

    if (password.length > 128) {
      errors.push("Mot de passe ne peut pas dépasser 128 caractères");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Mot de passe doit contenir au moins une minuscule");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Mot de passe doit contenir au moins une majuscule");
    }

    if (!/\d/.test(password)) {
      errors.push("Mot de passe doit contenir au moins un chiffre");
    }

    // Vérifier les mots de passe faibles
    const weakPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
    ];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push("Mot de passe trop faible");
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validation des données météorologiques
  static validateWeatherData(data: {
    temperature: number;
    rainfall: number;
    humidity: number;
    windSpeed?: number;
  }): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isValid = true;

    // Validation de la température (climat sénégalais)
    if (typeof data.temperature !== "number" || isNaN(data.temperature)) {
      warnings.push("Température invalide");
      isValid = false;
    } else if (data.temperature < 10 || data.temperature > 50) {
      warnings.push(`Température inhabituelle: ${data.temperature}°C`);
    }

    // Validation de l'humidité
    if (typeof data.humidity !== "number" || isNaN(data.humidity)) {
      warnings.push("Humidité invalide");
      isValid = false;
    } else if (data.humidity < 0 || data.humidity > 100) {
      warnings.push(`Humidité invalide: ${data.humidity}%`);
      isValid = false;
    }

    // Validation des précipitations
    if (typeof data.rainfall !== "number" || isNaN(data.rainfall)) {
      warnings.push("Précipitations invalides");
      isValid = false;
    } else if (data.rainfall < 0 || data.rainfall > 500) {
      warnings.push(`Précipitations inhabituelles: ${data.rainfall}mm`);
    }

    // Validation de la vitesse du vent
    if (data.windSpeed !== undefined) {
      if (typeof data.windSpeed !== "number" || isNaN(data.windSpeed)) {
        warnings.push("Vitesse du vent invalide");
        isValid = false;
      } else if (data.windSpeed < 0 || data.windSpeed > 200) {
        warnings.push(`Vitesse du vent inhabituelle: ${data.windSpeed}km/h`);
      }
    }

    return { isValid, warnings };
  }

  // Méthode utilitaire pour logger les validations
  static logValidationError(field: string, value: any, error: string): void {
    console.warn(
      `Validation error - Field: ${field}, Value: ${value}, Error: ${error}`
    );
  }

  // Validation groupée pour les lots de semences
  static validateSeedLotData(data: {
    varietyId: number | string;
    level: string;
    quantity: number;
    productionDate: string;
    expiryDate?: string;
  }): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation du niveau
    if (!this.isValidSeedLevel(data.level)) {
      errors.push("Niveau de semence invalide");
    }

    // Validation de la quantité
    if (!this.isValidQuantity(data.quantity, 1, 1000000)) {
      errors.push("Quantité invalide (doit être entre 1 et 1,000,000 kg)");
    }

    // Validation de la date de production
    if (!this.isValidDate(data.productionDate)) {
      errors.push("Date de production invalide");
    } else if (this.isDateInFuture(data.productionDate)) {
      errors.push("Date de production ne peut pas être dans le futur");
    }

    // Validation de la date d'expiration
    if (data.expiryDate) {
      if (!this.isValidDate(data.expiryDate)) {
        errors.push("Date d'expiration invalide");
      } else if (!this.isValidDateRange(data.productionDate, data.expiryDate)) {
        errors.push("Date d'expiration doit être après la date de production");
      } else if (this.isDateInPast(data.expiryDate)) {
        warnings.push("Date d'expiration déjà passée");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}

// ✅ CORRECTION: Schémas Yup conditionnels (seulement si yup est disponible)
let seedLotValidationSchema: any;

if (yup) {
  seedLotValidationSchema = yup.object({
    varietyId: yup
      .number()
      .positive("ID variété doit être positif")
      .required("Variété requise"),
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
      .test(
        "is-valid-date",
        "Date de production invalide",
        function (this: any, value: any) {
          if (!value) return false;
          return ValidationUtils.isValidDate(value);
        }
      )
      .test(
        "is-not-future",
        "La date de production ne peut pas être dans le futur",
        function (this: any, value: any) {
          if (!value) return true;
          return !ValidationUtils.isDateInFuture(value);
        }
      ),
    expiryDate: yup
      .string()
      .optional()
      .test(
        "is-valid-date",
        "Date d'expiration invalide",
        function (this: any, value: any) {
          if (!value) return true;
          return ValidationUtils.isValidDate(value);
        }
      )
      .test(
        "is-after-production",
        "La date d'expiration doit être après la production",
        function (this: any, value: any) {
          if (!value) return true;
          const parent = this.parent;
          const { productionDate } = parent;
          if (!productionDate) return true;
          return ValidationUtils.isValidDateRange(productionDate, value);
        }
      ),
    notes: yup
      .string()
      .max(1000, "Notes trop longues (max 1000 caractères)")
      .optional(),
  });
} else {
  // Fallback si yup n'est pas disponible
  seedLotValidationSchema = {
    validate: (data: any) => ValidationUtils.validateSeedLotData(data),
  };
}

// ✅ CORRECTION: Schémas supplémentaires avec types explicites
export const qualityControlValidationSchema = yup
  ? yup.object({
      lotId: yup.string().min(1, "ID de lot requis").required("Lot requis"),
      controlDate: yup
        .string()
        .required("Date de contrôle requise")
        .test(
          "is-valid-date",
          "Date de contrôle invalide",
          function (this: any, value: any) {
            if (!value) return false;
            return ValidationUtils.isValidDate(value);
          }
        )
        .test(
          "is-not-future",
          "La date de contrôle ne peut pas être dans le futur",
          function (this: any, value: any) {
            if (!value) return true;
            return !ValidationUtils.isDateInFuture(value);
          }
        ),
      germinationRate: yup
        .number()
        .min(0, "Taux de germination minimum 0%")
        .max(100, "Taux de germination maximum 100%")
        .required("Taux de germination requis"),
      varietyPurity: yup
        .number()
        .min(0, "Pureté variétale minimum 0%")
        .max(100, "Pureté variétale maximum 100%")
        .required("Pureté variétale requise"),
      moistureContent: yup
        .number()
        .min(0, "Taux d'humidité minimum 0%")
        .max(100, "Taux d'humidité maximum 100%")
        .optional(),
      seedHealth: yup
        .number()
        .min(0, "Santé des graines minimum 0%")
        .max(100, "Santé des graines maximum 100%")
        .optional(),
      observations: yup
        .string()
        .max(1000, "Observations trop longues (max 1000 caractères)")
        .optional(),
      testMethod: yup
        .string()
        .max(100, "Méthode de test trop longue (max 100 caractères)")
        .optional(),
    })
  : null;

export const varietyValidationSchema = yup
  ? yup.object({
      code: yup
        .string()
        .required("Code requis")
        .min(2, "Code trop court (min 2 caractères)")
        .max(20, "Code trop long (max 20 caractères)")
        .matches(
          /^[A-Z0-9-_]+$/,
          "Code invalide (majuscules, chiffres, tirets et underscores uniquement)"
        ),
      name: yup
        .string()
        .required("Nom requis")
        .min(2, "Nom trop court (min 2 caractères)")
        .max(100, "Nom trop long (max 100 caractères)"),
      cropType: yup
        .string()
        .oneOf(
          ["RICE", "MAIZE", "PEANUT", "SORGHUM", "COWPEA", "MILLET"],
          "Type de culture invalide"
        )
        .required("Type de culture requis"),
      description: yup
        .string()
        .max(1000, "Description trop longue (max 1000 caractères)")
        .optional(),
      maturityDays: yup
        .number()
        .positive("Durée de maturation doit être positive")
        .min(30, "Durée minimum 30 jours")
        .max(365, "Durée maximum 365 jours")
        .integer("Durée doit être un nombre entier")
        .required("Durée de maturation requise"),
      yieldPotential: yup
        .number()
        .positive("Potentiel de rendement doit être positif")
        .max(50, "Potentiel de rendement très élevé (> 50 t/ha)")
        .optional(),
      resistances: yup
        .array()
        .of(yup.string().min(1, "Résistance ne peut pas être vide"))
        .max(20, "Maximum 20 résistances")
        .optional(),
      origin: yup
        .string()
        .max(100, "Origine trop longue (max 100 caractères)")
        .optional(),
      releaseYear: yup
        .number()
        .min(1900, "Année trop ancienne")
        .max(new Date().getFullYear(), "Année future non autorisée")
        .integer("Année doit être un nombre entier")
        .optional(),
    })
  : null;

export const multiplierValidationSchema = yup
  ? yup.object({
      name: yup
        .string()
        .required("Nom requis")
        .min(2, "Nom trop court (min 2 caractères)")
        .max(100, "Nom trop long (max 100 caractères)"),
      address: yup
        .string()
        .required("Adresse requise")
        .min(5, "Adresse trop courte (min 5 caractères)")
        .max(200, "Adresse trop longue (max 200 caractères)"),
      latitude: yup
        .number()
        .min(-90, "Latitude minimum -90°")
        .max(90, "Latitude maximum 90°")
        .required("Latitude requise"),
      longitude: yup
        .number()
        .min(-180, "Longitude minimum -180°")
        .max(180, "Longitude maximum 180°")
        .required("Longitude requise"),
      yearsExperience: yup
        .number()
        .min(0, "Expérience ne peut pas être négative")
        .max(50, "Expérience très élevée (> 50 ans)")
        .integer("Expérience doit être un nombre entier")
        .required("Années d'expérience requises"),
      certificationLevel: yup
        .string()
        .oneOf(
          ["BEGINNER", "INTERMEDIATE", "EXPERT"],
          "Niveau de certification invalide"
        )
        .required("Niveau de certification requis"),
      specialization: yup
        .array()
        .of(
          yup
            .string()
            .oneOf(
              ["RICE", "MAIZE", "PEANUT", "SORGHUM", "COWPEA", "MILLET"],
              "Spécialisation invalide"
            )
        )
        .min(1, "Au moins une spécialisation requise")
        .max(6, "Maximum 6 spécialisations")
        .required("Spécialisations requises"),
      phone: yup
        .string()
        .matches(
          /^(\+221)?[0-9]{8,9}$/,
          "Numéro de téléphone sénégalais invalide"
        )
        .optional(),
      email: yup
        .string()
        .email("Adresse email invalide")
        .max(100, "Email trop long (max 100 caractères)")
        .optional(),
    })
  : null;

// Export des schémas
export { seedLotValidationSchema };

// Export par défaut pour compatibilité
export default ValidationUtils;
