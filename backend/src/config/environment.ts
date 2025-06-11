// backend/src/config/environment.ts - Configuration d'environnement CORRIGÉE
import dotenv from "dotenv";
import { ValidationUtils } from "../utils/validation";

dotenv.config();

// ✅ CORRECTION: Fonction de validation JWT sécurisée mais non bloquante
function validateJwtSecret(secret: string | undefined): string {
  if (!secret) {
    throw new Error("JWT_SECRET est requis dans les variables d'environnement");
  }

  if (secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET doit contenir au moins 32 caractères en production"
      );
    } else {
      console.warn(
        "⚠️  JWT_SECRET court détecté en développement (minimum 32 caractères recommandé)"
      );
    }
  }

  // En production, valider que le secret n'est pas un placeholder
  if (process.env.NODE_ENV === "production") {
    const dangerousPatterns = [
      "change",
      "test",
      "demo",
      "example",
      "placeholder",
      "secret",
      "password",
      "123456",
      "default",
    ];

    const lowerSecret = secret.toLowerCase();
    if (dangerousPatterns.some((pattern) => lowerSecret.includes(pattern))) {
      throw new Error(
        "JWT_SECRET doit être changé en production (ne pas utiliser de valeurs par défaut)"
      );
    }

    if (secret.length < 64) {
      console.warn(
        "⚠️  AVERTISSEMENT: JWT_SECRET devrait faire au moins 64 caractères en production"
      );
    }
  }

  return secret;
}

function validateDuration(
  duration: string | undefined,
  defaultValue: string
): string {
  if (!duration) return defaultValue;

  // Vérifier le format (nombre suivi d'une unité: s, m, h, d, w, y)
  const validFormat = /^\d+[smhdwy]$/.test(duration);
  if (!validFormat) {
    console.warn(
      `⚠️  Format de durée potentiellement invalide: ${duration}. Format attendu: 15m, 1h, 7d, 2w, 1y`
    );
    return defaultValue;
  }

  return duration;
}

function validatePort(port: string | undefined, defaultPort: number): number {
  const portNum = ValidationUtils.safeParseInt(port, defaultPort);

  if (portNum < 1 || portNum > 65535) {
    console.warn(
      `⚠️  Port invalide: ${port}. Utilisation du port par défaut: ${defaultPort}`
    );
    return defaultPort;
  }

  // Vérifier les ports réservés en production
  if (process.env.NODE_ENV === "production") {
    const reservedPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
    if (reservedPorts.includes(portNum)) {
      console.warn(`⚠️  Port ${portNum} est un port système réservé`);
    }
  }

  return portNum;
}

function validateDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error("DATABASE_URL est requis");
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    throw new Error("DATABASE_URL doit être une URL PostgreSQL valide");
  }

  try {
    new URL(url);
  } catch (error) {
    const maskedUrl = url.replace(/:([^:@]*?)@/, ":***@");
    throw new Error(`DATABASE_URL invalide: ${maskedUrl}`);
  }

  return url;
}

function validateUrl(
  url: string | undefined,
  name: string,
  required: boolean = true
): string {
  if (!url) {
    if (required) {
      throw new Error(`${name} est requis`);
    }
    return "";
  }

  if (!ValidationUtils.isValidURL(url)) {
    if (required && process.env.NODE_ENV === "production") {
      throw new Error(`${name} doit être une URL valide: ${url}`);
    } else {
      console.warn(`⚠️  ${name} URL potentiellement invalide: ${url}`);
      return url; // Permettre en développement
    }
  }

  return url;
}

// ✅ CORRECTION: Interface pour typer la configuration complète
interface ConfigType {
  environment: string;
  server: {
    port: number;
    host: string;
  };
  database: {
    url: string;
    maxConnections: number;
    connectionTimeout: number;
  };
  jwt: {
    secret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };
  client: {
    url: string;
  };
  bcrypt: {
    saltRounds: number;
  };
  upload: {
    maxFileSize: number;
    allowedFormats: string[];
    uploadPath: string;
  };
  qrCode: {
    baseUrl: string;
  };
  security: {
    rateLimitWindowMs: number;
    rateLimitMax: number;
    corsOrigins: string[];
    trustProxy: boolean;
  };
  logging: {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
    maxFiles: number;
    maxSize: string;
  };
  cache: {
    defaultTTL: number;
    checkPeriod: number;
    maxKeys: number;
  };
  email: {
    enabled: boolean;
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    from?: string;
  };
  monitoring: {
    enabled: boolean;
    metricsPort?: number;
    healthCheckInterval: number;
  };
}

// ✅ CORRECTION: Configuration complète et typée avec gestion d'erreurs non bloquante
export const config: ConfigType = {
  environment: process.env.NODE_ENV || "development",

  server: {
    port: validatePort(process.env.PORT, 3001),
    host: process.env.HOST || "localhost",
  },

  database: {
    url: validateDatabaseUrl(process.env.DATABASE_URL),
    maxConnections: ValidationUtils.safeParseInt(
      process.env.DB_MAX_CONNECTIONS,
      10
    ),
    connectionTimeout: ValidationUtils.safeParseInt(
      process.env.DB_CONNECTION_TIMEOUT,
      60000
    ),
  },

  jwt: {
    secret: validateJwtSecret(process.env.JWT_SECRET),
    accessTokenExpiry: validateDuration(process.env.JWT_ACCESS_EXPIRY, "15m"),
    refreshTokenExpiry: validateDuration(process.env.JWT_REFRESH_EXPIRY, "7d"),
    issuer: process.env.JWT_ISSUER || "isra-seed-trace",
    audience: process.env.JWT_AUDIENCE || "isra-seed-trace-users",
  },

  client: {
    url:
      validateUrl(process.env.CLIENT_URL, "CLIENT_URL", false) ||
      "http://localhost:5173",
  },

  bcrypt: {
    saltRounds: Math.max(
      ValidationUtils.safeParseInt(process.env.BCRYPT_SALT_ROUNDS, 12),
      10
    ),
  },

  upload: {
    maxFileSize: ValidationUtils.safeParseInt(
      process.env.MAX_FILE_SIZE,
      10485760
    ), // 10MB
    allowedFormats: (
      process.env.ALLOWED_FILE_FORMATS ||
      "pdf,doc,docx,xls,xlsx,csv,jpg,jpeg,png"
    ).split(","),
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },

  qrCode: {
    baseUrl:
      process.env.QR_BASE_URL || "https://api.qrserver.com/v1/create-qr-code/",
  },

  security: {
    rateLimitWindowMs: ValidationUtils.safeParseInt(
      process.env.RATE_LIMIT_WINDOW,
      15 * 60 * 1000
    ),
    rateLimitMax: ValidationUtils.safeParseInt(process.env.RATE_LIMIT_MAX, 100),
    corsOrigins: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
    trustProxy: process.env.TRUST_PROXY === "true",
  },

  logging: {
    level:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
    enableConsole: process.env.ENABLE_CONSOLE_LOGS !== "false",
    enableFile: process.env.ENABLE_FILE_LOGS !== "false",
    maxFiles: ValidationUtils.safeParseInt(process.env.LOG_MAX_FILES, 10),
    maxSize: process.env.LOG_MAX_SIZE || "5m",
  },

  cache: {
    defaultTTL: ValidationUtils.safeParseInt(process.env.CACHE_TTL, 300), // 5 minutes
    checkPeriod: ValidationUtils.safeParseInt(
      process.env.CACHE_CHECK_PERIOD,
      60
    ), // 1 minute
    maxKeys: ValidationUtils.safeParseInt(process.env.CACHE_MAX_KEYS, 1000),
  },

  email: {
    enabled: process.env.EMAIL_ENABLED === "true",
    host: process.env.EMAIL_HOST,
    port: ValidationUtils.safeParseInt(process.env.EMAIL_PORT, 587),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "noreply@isra.sn",
  },

  monitoring: {
    enabled: process.env.MONITORING_ENABLED === "true",
    metricsPort: ValidationUtils.safeParseInt(process.env.METRICS_PORT, 9090),
    healthCheckInterval: ValidationUtils.safeParseInt(
      process.env.HEALTH_CHECK_INTERVAL,
      30000
    ),
  },
};

// ✅ CORRECTION: Validation NON BLOQUANTE qui ne provoque pas de process.exit
export function validateConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validation de l'environnement
    const validEnvs = ["development", "test", "production", "staging"];
    if (!validEnvs.includes(config.environment)) {
      errors.push(
        `NODE_ENV invalide: ${config.environment}. Valeurs acceptées: ${validEnvs.join(", ")}`
      );
    }

    // Validation spécifique à la production
    if (config.environment === "production") {
      // JWT
      if (config.jwt.secret.length < 64) {
        warnings.push(
          "JWT_SECRET devrait faire au moins 64 caractères en production"
        );
      }

      // Base de données
      if (
        config.database.url.includes("localhost") ||
        config.database.url.includes("127.0.0.1")
      ) {
        warnings.push("DATABASE_URL pointe vers localhost en production");
      }

      // Client URL
      if (
        config.client.url.includes("localhost") ||
        config.client.url.includes("127.0.0.1")
      ) {
        warnings.push("CLIENT_URL pointe vers localhost en production");
      }

      // Email
      if (!config.email.enabled) {
        warnings.push("Email désactivé en production");
      }

      // HTTPS
      if (!config.client.url.startsWith("https://")) {
        warnings.push("CLIENT_URL devrait utiliser HTTPS en production");
      }
    }

    // Validation du bcrypt
    if (config.bcrypt.saltRounds < 10) {
      if (config.environment === "production") {
        errors.push(
          "BCRYPT_SALT_ROUNDS doit être au moins 10 pour la sécurité"
        );
      } else {
        warnings.push("BCRYPT_SALT_ROUNDS faible détecté (< 10)");
      }
    }

    if (config.bcrypt.saltRounds > 15) {
      warnings.push(
        "BCRYPT_SALT_ROUNDS très élevé, peut ralentir l'application"
      );
    }

    // Validation de l'upload
    if (config.upload.maxFileSize > 100 * 1024 * 1024) {
      // 100MB
      warnings.push(
        "MAX_FILE_SIZE très élevé, peut causer des problèmes de mémoire"
      );
    }

    // Validation du cache
    if (config.cache.maxKeys > 10000) {
      warnings.push(
        "CACHE_MAX_KEYS très élevé, peut consommer beaucoup de mémoire"
      );
    }

    // Validation du rate limiting
    if (config.security.rateLimitMax > 1000) {
      warnings.push("RATE_LIMIT_MAX très élevé, peut permettre des abus");
    }
  } catch (error: any) {
    errors.push(`Erreur lors de la validation: ${error.message}`);
  }

  // ✅ CORRECTION: Affichage des résultats SANS process.exit
  if (warnings.length > 0) {
    console.warn("⚠️  Avertissements de configuration:");
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  if (errors.length > 0) {
    console.error("❌ Erreurs de configuration détectées:");
    errors.forEach((error) => console.error(`   - ${error}`));

    if (config.environment === "production") {
      console.error(
        "🚨 Configuration invalide en production - l'application peut ne pas fonctionner correctement"
      );
      // ✅ CORRECTION: Ne pas faire process.exit, laisser l'application décider
    } else {
      console.warn(
        "⚠️  Erreurs de configuration en mode développement - tentative de continuation"
      );
    }
  } else {
    console.log("✅ Configuration validée avec succès");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ✅ CORRECTION: Helper pour obtenir des informations sur l'environnement (sécurisé)
export function getEnvironmentInfo() {
  return {
    environment: config.environment,
    version: process.env.npm_package_version || "1.0.0",
    nodeVersion: process.version,
    port: config.server.port,
    host: config.server.host,
    database: config.database.url.replace(/:[^:@]*@/, ":***@"), // Masquer le mot de passe
    jwtExpiry: config.jwt.accessTokenExpiry,
    uploadMaxSize: `${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`,
    logLevel: config.logging.level,
    cacheEnabled: config.cache.defaultTTL > 0,
    emailEnabled: config.email.enabled,
    monitoringEnabled: config.monitoring.enabled,
  };
}

// ✅ CORRECTION: Helper pour vérifier si on est en mode développement
export function isDevelopment(): boolean {
  return config.environment === "development";
}

// ✅ CORRECTION: Helper pour vérifier si on est en production
export function isProduction(): boolean {
  return config.environment === "production";
}

// ✅ CORRECTION: Helper pour vérifier si on est en mode test
export function isTest(): boolean {
  return config.environment === "test";
}

// ✅ CORRECTION: Auto-validation au chargement du module mais NON BLOQUANTE
if (!isTest()) {
  try {
    const validation = validateConfig();

    // En production, si erreurs critiques, au moins avertir
    if (!validation.isValid && isProduction()) {
      console.error(
        "🚨 ATTENTION: Configuration invalide détectée en production!"
      );
      console.error("L'application peut ne pas fonctionner correctement.");
      console.error("Vérifiez les erreurs ci-dessus avant de continuer.");
    }

    // En développement, toujours continuer
    if (!validation.isValid && isDevelopment()) {
      console.warn(
        "⚠️  Configuration avec erreurs en développement - continuation"
      );
    }
  } catch (error: any) {
    console.error(
      "❌ Erreur fatale lors de la validation de configuration:",
      error.message
    );

    // Seulement en production, considérer un exit
    if (isProduction()) {
      console.error(
        "🚨 Arrêt en production à cause d'une erreur de configuration fatale"
      );
      process.exit(1);
    } else {
      console.warn(
        "⚠️  Erreur de configuration en développement - tentative de continuation"
      );
    }
  }
}

// ✅ CORRECTION: Exporter une fonction utilitaire pour valider manuellement
export function validateConfigOrExit(): void {
  const validation = validateConfig();

  if (!validation.isValid) {
    console.error("❌ Configuration invalide - arrêt de l'application");
    console.error("Erreurs détectées:", validation.errors);
    process.exit(1);
  }
}

// ✅ CORRECTION: Export par défaut pour compatibilité
export default config;
