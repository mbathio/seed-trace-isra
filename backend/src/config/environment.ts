// backend/src/config/environment.ts
import * as dotenv from "dotenv";
import * as path from "path";

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Types pour la configuration
interface DatabaseConfig {
  type: "postgres";
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  url: string;
  entities: string[];
  migrations: string[];
  synchronize: boolean;
  logging: boolean;
  ssl?: {
    rejectUnauthorized: boolean;
  };
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

interface StorageConfig {
  type: "local" | "s3";
  local?: {
    uploadDir: string;
    publicPath: string;
  };
  s3?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
}

interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  defaultJobOptions: {
    removeOnComplete: boolean;
    removeOnFail: boolean;
    attempts: number;
    backoff: {
      type: string;
      delay: number;
    };
  };
}

interface MonitoringConfig {
  enabled: boolean;
  metricsPort?: number;
  metricsPath?: string;
  collectDefaultMetrics?: boolean;
  healthCheckInterval?: number;
}

interface SecurityConfig {
  bcryptRounds: number;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string | string[] | boolean;
    credentials: boolean;
  };
}

interface GeolocationConfig {
  mapboxToken?: string;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
}

interface SeedTraceabilityConfig {
  seedLevels: string[];
  qrCodeOptions: {
    width: number;
    margin: number;
    color: {
      dark: string;
      light: string;
    };
  };
  offlineSync: {
    enabled: boolean;
    syncInterval: number;
    maxRetries: number;
  };
}

// Ajout des configurations manquantes pour server et client
interface ServerConfig {
  port: number;
  host: string;
}

interface ClientConfig {
  url: string | string[];
}

interface ConfigType {
  env: string;
  port: number;
  apiPrefix: string;
  appName: string;
  appVersion: string;
  server: ServerConfig;
  client: ClientConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  email: EmailConfig;
  storage: StorageConfig;
  queue: QueueConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  geolocation: GeolocationConfig;
  seedTraceability: SeedTraceabilityConfig;
}

// Fonction helper pour parser les variables d'environnement
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
};

// Configuration principale
const config: ConfigType = {
  env: getEnvVar("NODE_ENV", "development"),
  port: getEnvNumber("PORT", 3000),
  apiPrefix: getEnvVar("API_PREFIX", "/api/v1"),
  appName: getEnvVar("APP_NAME", "ISRA Seed Traceability System"),
  appVersion: getEnvVar("APP_VERSION", "1.0.0"),

  // Configuration du serveur
  server: {
    port: getEnvNumber("PORT", 3000),
    host: getEnvVar("HOST", "0.0.0.0"),
  },

  // Configuration du client
  client: {
    url: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : ["http://localhost:3000", "http://localhost:5173"],
  },

  database: {
    type: "postgres",
    host: getEnvVar("DB_HOST", "localhost"),
    port: getEnvNumber("DB_PORT", 5432),
    username: getEnvVar("DB_USERNAME", "isra_user"),
    password: getEnvVar("DB_PASSWORD", ""),
    database: getEnvVar("DB_DATABASE", "isra_seeds"),
    url: getEnvVar(
      "DATABASE_URL",
      "postgresql://user1:user1@localhost:5432/isra_seeds?schema=public"
    ),
    entities: [path.join(__dirname, "../**/*.entity{.ts,.js}")],
    migrations: [path.join(__dirname, "../migrations/*{.ts,.js}")],
    synchronize: getEnvBoolean("DB_SYNCHRONIZE", false),
    logging: getEnvBoolean("DB_LOGGING", false),
    ...(getEnvVar("NODE_ENV", "development") === "production" && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  },

  redis: {
    host: getEnvVar("REDIS_HOST", "localhost"),
    port: getEnvNumber("REDIS_PORT", 6379),
    password: process.env.REDIS_PASSWORD,
    db: getEnvNumber("REDIS_DB", 0),
    ttl: getEnvNumber("REDIS_TTL", 3600), // 1 heure par défaut
  },

  jwt: {
    secret: getEnvVar("JWT_SECRET", "default-jwt-secret-change-me"),
    expiresIn: getEnvVar("JWT_EXPIRES_IN", "1d"),
    refreshSecret: getEnvVar(
      "JWT_REFRESH_SECRET",
      "default-refresh-secret-change-me"
    ),
    refreshExpiresIn: getEnvVar("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  email: {
    host: getEnvVar("SMTP_HOST", "smtp.gmail.com"),
    port: getEnvNumber("SMTP_PORT", 587),
    secure: getEnvBoolean("SMTP_SECURE", false),
    auth: {
      user: getEnvVar("SMTP_USER", ""),
      pass: getEnvVar("SMTP_PASS", ""),
    },
    from: getEnvVar("SMTP_FROM", "noreply@isra.sn"),
  },

  storage: {
    type: getEnvVar("STORAGE_TYPE", "local") as "local" | "s3",
    ...(getEnvVar("STORAGE_TYPE", "local") === "local" && {
      local: {
        uploadDir: getEnvVar("UPLOAD_DIR", "./uploads"),
        publicPath: getEnvVar("PUBLIC_PATH", "/uploads"),
      },
    }),
    ...(getEnvVar("STORAGE_TYPE", "local") === "s3" && {
      s3: {
        accessKeyId: getEnvVar("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: getEnvVar("AWS_SECRET_ACCESS_KEY", ""),
        region: getEnvVar("AWS_REGION", "eu-west-1"),
        bucket: getEnvVar("AWS_S3_BUCKET", ""),
      },
    }),
  },

  queue: {
    redis: {
      host: getEnvVar("QUEUE_REDIS_HOST", "localhost"),
      port: getEnvNumber("QUEUE_REDIS_PORT", 6379),
      password: process.env.QUEUE_REDIS_PASSWORD,
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  },

  monitoring: {
    enabled: getEnvBoolean("MONITORING_ENABLED", true),
    metricsPort: getEnvNumber("METRICS_PORT", 9090),
    metricsPath: getEnvVar("METRICS_PATH", "/metrics"),
    collectDefaultMetrics: getEnvBoolean("COLLECT_DEFAULT_METRICS", true),
    healthCheckInterval: getEnvNumber("HEALTH_CHECK_INTERVAL", 30000), // 30 secondes
  },

  security: {
    bcryptRounds: getEnvNumber("BCRYPT_ROUNDS", 10),
    rateLimit: {
      windowMs: getEnvNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 minutes
      max: getEnvNumber("RATE_LIMIT_MAX", 100),
    },
    cors: {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    },
  },

  geolocation: {
    mapboxToken: process.env.MAPBOX_TOKEN,
    defaultCenter: {
      lat: 16.0171, // Saint-Louis, Sénégal
      lng: -16.4896,
    },
    defaultZoom: 12,
  },

  seedTraceability: {
    seedLevels: ["G0", "G1", "G2", "G3", "G4", "R1", "R2"],
    qrCodeOptions: {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    },
    offlineSync: {
      enabled: getEnvBoolean("OFFLINE_SYNC_ENABLED", true),
      syncInterval: getEnvNumber("SYNC_INTERVAL", 300000), // 5 minutes
      maxRetries: getEnvNumber("SYNC_MAX_RETRIES", 3),
    },
  },
};

// Interface pour le résultat de validation
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validation de la configuration
const validateConfig = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifier les variables critiques
  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "SMTP_USER",
    "SMTP_PASS",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0 && config.env === "production") {
    errors.push(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  // Avertissements pour le développement
  if (config.env === "development" && missingVars.length > 0) {
    warnings.push(
      `Missing environment variables: ${missingVars.join(
        ", "
      )}. Using defaults for development.`
    );
  }

  // Logger les warnings
  warnings.forEach((warning) => {
    console.warn(`⚠️  ${warning}`);
  });

  // Logger les erreurs
  errors.forEach((error) => {
    console.error(`❌ ${error}`);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Fonctions helpers pour vérifier l'environnement
const isDevelopment = (): boolean => config.env === "development";
const isProduction = (): boolean => config.env === "production";
const isTest = (): boolean => config.env === "test";

// Logger la configuration au démarrage (sans les informations sensibles)
if (config.env === "development") {
  console.log("🚀 Configuration loaded:", {
    env: config.env,
    port: config.port,
    appName: config.appName,
    database: {
      host: config.database.host,
      database: config.database.database,
    },
    redis: {
      host: config.redis.host,
      port: config.redis.port,
    },
    monitoring: config.monitoring,
    seedLevels: config.seedTraceability.seedLevels,
  });
}

// Exports nommés pour server.ts
export {
  config,
  validateConfig,
  isDevelopment,
  isProduction,
  isTest,
  ConfigType,
  ValidationResult,
};

// Export par défaut pour compatibilité
export default config;
