// backend/src/utils/validation.ts - Utilitaires de validation étendus et corrigés
export class ValidationUtils {
  /**
   * Validation d'email avec support des domaines sénégalais
   */
  static isValidEmail(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.toLowerCase());
  }

  /**
   * Validation des numéros de téléphone sénégalais
   * Formats acceptés: 77XXXXXXX, 78XXXXXXX, 70XXXXXXX, 76XXXXXXX, 75XXXXXXX
   * Avec ou sans +221
   */
  static isValidPhoneNumber(phone: string): boolean {
    // Nettoyer le numéro (supprimer espaces, tirets, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Patterns pour les numéros sénégalais
    const patterns = [
      /^(\+221)?(7[0-8])\d{7}$/, // Format international ou national
      /^(7[0-8])\d{7}$/, // Format national simple
    ];

    return patterns.some((pattern) => pattern.test(cleanPhone));
  }

  /**
   * Validation des coordonnées GPS
   */
  static isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Validation spécifique pour les coordonnées du Sénégal
   */
  static isValidSenegalCoordinates(lat: number, lng: number): boolean {
    const bounds = {
      latMin: 12.0,
      latMax: 16.7,
      lngMin: -17.6,
      lngMax: -11.3,
    };

    return (
      this.isValidCoordinates(lat, lng) &&
      lat >= bounds.latMin &&
      lat <= bounds.latMax &&
      lng >= bounds.lngMin &&
      lng <= bounds.lngMax
    );
  }

  /**
   * Nettoyer une chaîne de caractères (supprimer caractères dangereux)
   */
  static sanitizeString(str: string): string {
    return str
      .trim()
      .replace(/[<>]/g, "") // Supprimer < et >
      .replace(/[\x00-\x1F\x7F]/g, "") // Supprimer caractères de contrôle
      .substring(0, 1000); // Limiter la longueur
  }

  /**
   * Validation des niveaux de semences
   */
  static isValidSeedLevel(level: string): boolean {
    const validLevels = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
    return validLevels.includes(level.toUpperCase());
  }

  /**
   * Validation des types de culture
   */
  static isValidCropType(cropType: string): boolean {
    const validTypes = [
      "RICE",
      "MAIZE",
      "PEANUT",
      "SORGHUM",
      "COWPEA",
      "MILLET",
    ];
    return validTypes.includes(cropType.toUpperCase());
  }

  /**
   * Validation de la hiérarchie des niveaux de semences
   */
  static isValidLevelHierarchy(
    parentLevel: string,
    childLevel: string
  ): boolean {
    const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
    const parentIndex = levelHierarchy.indexOf(parentLevel.toUpperCase());
    const childIndex = levelHierarchy.indexOf(childLevel.toUpperCase());

    if (parentIndex === -1 || childIndex === -1) return false;

    // Le niveau enfant doit être supérieur au niveau parent
    return childIndex > parentIndex;
  }

  /**
   * Validation de mot de passe fort
   */
  static isStrongPassword(password: string): boolean {
    // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  }

  /**
   * Validation de pourcentage (0-100)
   */
  static isValidPercentage(value: number): boolean {
    return typeof value === "number" && value >= 0 && value <= 100;
  }

  /**
   * Validation de quantité de semences selon le niveau
   */
  static isValidQuantityForLevel(quantity: number, level: string): boolean {
    const levelLimits: Record<string, { min: number; max: number }> = {
      GO: { min: 10, max: 1000 },
      G1: { min: 100, max: 5000 },
      G2: { min: 500, max: 10000 },
      G3: { min: 1000, max: 20000 },
      G4: { min: 2000, max: 50000 },
      R1: { min: 5000, max: 100000 },
      R2: { min: 10000, max: 500000 },
    };

    const limits = levelLimits[level.toUpperCase()];
    if (!limits) return false;

    return quantity >= limits.min && quantity <= limits.max;
  }

  /**
   * Validation de date dans une plage acceptable
   */
  static isValidProductionDate(date: Date): boolean {
    const now = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    return date <= now && date >= twoYearsAgo;
  }

  /**
   * Validation de date d'expiration logique
   */
  static isValidExpiryDate(expiryDate: Date, productionDate: Date): boolean {
    const maxShelfLife = new Date(productionDate);
    maxShelfLife.setFullYear(maxShelfLife.getFullYear() + 3); // Max 3 ans

    return expiryDate > productionDate && expiryDate <= maxShelfLife;
  }

  /**
   * Validation d'ID au format UUID ou numérique
   */
  static isValidId(id: string | number): boolean {
    if (typeof id === "number") {
      return Number.isInteger(id) && id > 0;
    }

    if (typeof id === "string") {
      // UUID v4 ou format custom (ex: SL-G1-2024-001)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const customIdRegex = /^[A-Z]{2}-[A-Z0-9]+-\d{4}-\d{3}$/;
      const numericRegex = /^\d+$/;

      return (
        uuidRegex.test(id) || customIdRegex.test(id) || numericRegex.test(id)
      );
    }

    return false;
  }

  /**
   * Validation de nom de fichier sécurisé
   */
  static isValidFilename(filename: string): boolean {
    const dangerousChars = /[<>:"/\\|?*\x00-\x1F]/;
    const reservedNames = [
      "CON",
      "PRN",
      "AUX",
      "NUL",
      "COM1",
      "COM2",
      "COM3",
      "COM4",
      "COM5",
      "COM6",
      "COM7",
      "COM8",
      "COM9",
      "LPT1",
      "LPT2",
      "LPT3",
      "LPT4",
      "LPT5",
      "LPT6",
      "LPT7",
      "LPT8",
      "LPT9",
    ];

    if (dangerousChars.test(filename)) return false;
    if (filename.length > 255) return false;
    if (reservedNames.includes(filename.toUpperCase())) return false;
    if (filename.startsWith(".") || filename.endsWith(".")) return false;

    return true;
  }

  /**
   * Conversion sécurisée string vers number
   */
  static safeParseInt(value: any, defaultValue: number = 0): number {
    if (typeof value === "number") return Math.floor(value);

    const parsed = parseInt(value?.toString() || defaultValue.toString());
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Conversion sécurisée string vers float
   */
  static safeParseFloat(value: any, defaultValue: number = 0): number {
    if (typeof value === "number") return value;

    const parsed = parseFloat(value?.toString() || defaultValue.toString());
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validation de taille de fichier
   */
  static isValidFileSize(
    sizeInBytes: number,
    maxSizeInMB: number = 10
  ): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
  }

  /**
   * Validation d'extension de fichier
   */
  static isValidFileExtension(
    filename: string,
    allowedExtensions: string[]
  ): boolean {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  /**
   * Validation de code postal sénégalais
   */
  static isValidSenegalPostalCode(postalCode: string): boolean {
    // Format sénégalais: 5 chiffres (ex: 12000 pour Dakar)
    const postalRegex = /^\d{5}$/;
    return postalRegex.test(postalCode);
  }

  /**
   * Validation d'une adresse IP
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Validation de version sémantique
   */
  static isValidSemanticVersion(version: string): boolean {
    const semverRegex =
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semverRegex.test(version);
  }

  /**
   * Nettoyage et validation d'un nom d'utilisateur
   */
  static sanitizeUsername(username: string): string | null {
    const cleaned = username.trim().toLowerCase();
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;

    return usernameRegex.test(cleaned) ? cleaned : null;
  }

  /**
   * Validation d'une URL
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validation d'un code QR au format attendu
   */
  static isValidQRCode(qrData: string): boolean {
    try {
      const parsed = JSON.parse(qrData);
      return (
        parsed.lotId && parsed.varietyName && parsed.level && parsed.timestamp
      );
    } catch {
      return false;
    }
  }
}
