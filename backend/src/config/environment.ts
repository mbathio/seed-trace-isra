// backend/src/config/environment.ts - ✅ CORRIGÉ (erreurs TypeScript résolues)
import dotenv from "dotenv";

dotenv.config();

// ✅ CORRECTION: Fonction de validation centralisée
function validateJwtSecret(secret: string | undefined): string {
  if (!secret) {
    throw new Error("JWT_SECRET est requis");
  }

  if (secret.length < 32) {
    throw new Error("JWT_SECRET doit contenir au moins 32 caractères");
  }

  return secret;
}

function validateDuration(
  duration: string | undefined,
  defaultValue: string
): string {
  if (!duration) return defaultValue;

  // Vérifier le format (nombre suivi d'une unité: s, m, h, d)
  const validFormat = /^\d+[smhd]$/.test(duration);
  if (!validFormat) {
    throw new Error(
      `Format de durée invalide: ${duration}. Utilisez le format: 15m, 1h, 7d, etc.`
    );
  }

  return duration;
}

function validatePort(port: string | undefined, defaultPort: number): number {
  const portNum = parseInt(port || defaultPort.toString());

  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error(`Port invalide: ${port}. Doit être entre 1 et 65535`);
  }

  return portNum;
}

// ✅ CORRECTION: Interface pour typer la configuration
interface ConfigType {
  environment: string;
  server: {
    port: number;
    host: string;
  };
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
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
  };
  logging: {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
  };
  cache: {
    defaultTTL: number;
    checkPeriod: number;
  };
}

// ✅ CORRECTION: Configuration typée pour éviter l'erreur TS7022
export const config: ConfigType = {
  environment: process.env.NODE_ENV || "development",

  server: {
    port: validatePort(process.env.PORT, 3001),
    host: process.env.HOST || "localhost",
  },

  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user1:user1@localhost:5432/isra_seeds",
  },

  jwt: {
    // ✅ CORRECTION: Validation renforcée du secret JWT
    secret: validateJwtSecret(process.env.JWT_SECRET),
    accessTokenExpiry: validateDuration(process.env.JWT_ACCESS_EXPIRY, "15m"), // ✅ CORRIGÉ: durée sécurisée
    refreshTokenExpiry: validateDuration(process.env.JWT_REFRESH_EXPIRY, "7d"),
  },

  client: {
    url: process.env.CLIENT_URL || "http://localhost:5173",
  },

  bcrypt: {
    saltRounds: Math.max(parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"), 10), // ✅ Minimum 10 rounds
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
    allowedFormats: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "jpg",
      "jpeg",
      "png",
    ],
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },

  qrCode: {
    baseUrl:
      process.env.QR_BASE_URL || "https://api.qrserver.com/v1/create-qr-code/",
  },

  // ✅ CORRECTION: Configuration de sécurité consolidée
  security: {
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // 100 requêtes par fenêtre
    corsOrigins: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
  },

  // ✅ CORRECTION: Configuration de logging
  logging: {
    level:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
    enableConsole: process.env.ENABLE_CONSOLE_LOGS !== "false",
    enableFile: process.env.ENABLE_FILE_LOGS !== "false",
  },

  // ✅ CORRECTION: Configuration de cache
  cache: {
    defaultTTL: parseInt(process.env.CACHE_TTL || "300"), // 5 minutes
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || "60"), // 1 minute
  },
};

// ✅ CORRECTION: Validation au démarrage avec messages détaillés
export function validateConfig(): void {
  const errors: string[] = [];

  // Validation de l'environnement
  if (!["development", "test", "production"].includes(config.environment)) {
    errors.push(`NODE_ENV invalide: ${config.environment}`);
  }

  // Validation de la base de données
  if (!config.database.url.startsWith("postgresql://")) {
    errors.push("DATABASE_URL doit être une URL PostgreSQL valide");
  }

  // Validation du JWT en production
  if (config.environment === "production") {
    if (
      config.jwt.secret.includes("change") ||
      config.jwt.secret.includes("test")
    ) {
      errors.push("JWT_SECRET doit être changé en production");
    }

    if (config.jwt.secret.length < 64) {
      errors.push(
        "JWT_SECRET doit contenir au moins 64 caractères en production"
      );
    }
  }

  // Validation des durées JWT
  const accessDuration = config.jwt.accessTokenExpiry;
  if (accessDuration.includes("h") && parseInt(accessDuration) > 24) {
    errors.push(
      "JWT_ACCESS_EXPIRY ne devrait pas dépasser 24h pour la sécurité"
    );
  }

  // Validation du client URL
  try {
    new URL(config.client.url);
  } catch {
    errors.push(`CLIENT_URL invalide: ${config.client.url}`);
  }

  // Si des erreurs sont trouvées, les afficher et arrêter en production
  if (errors.length > 0) {
    console.error("❌ Erreurs de configuration détectées:");
    errors.forEach((error) => console.error(`   - ${error}`));

    if (config.environment === "production") {
      console.error(
        "🚨 Arrêt de l'application en raison d'erreurs de configuration en production"
      );
      process.exit(1);
    } else {
      console.warn(
        "⚠️  Continuité en mode développement malgré les erreurs de configuration"
      );
    }
  } else {
    console.log("✅ Configuration validée avec succès");
  }
}

// ✅ CORRECTION: Helper pour obtenir la configuration de l'environnement
export function getEnvironmentInfo() {
  return {
    environment: config.environment,
    version: process.env.npm_package_version || "1.0.0",
    nodeVersion: process.version,
    port: config.server.port,
    database: config.database.url.replace(/:[^:@]*@/, ":***@"), // Masquer le mot de passe
    jwtExpiry: config.jwt.accessTokenExpiry,
  };
}

// Auto-validation au chargement du module
if (require.main === module) {
  validateConfig();
}
