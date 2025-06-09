// backend/src/utils/logger.ts - ✅ CORRIGÉ avec configuration améliorée
import winston from "winston";
import path from "path";
import fs from "fs";

// ✅ CORRECTION: S'assurer que le dossier logs existe
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ✅ CORRECTION: Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Ajouter les métadonnées si elles existent
    if (Object.keys(meta).length > 0) {
      log += ` | ${JSON.stringify(meta)}`;
    }

    // Ajouter la stack trace pour les erreurs
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// ✅ CORRECTION: Configuration des transports selon l'environnement
const transports: winston.transport[] = [];

// Transport console (toujours actif en développement)
if (
  process.env.NODE_ENV !== "production" ||
  process.env.ENABLE_CONSOLE_LOGS !== "false"
) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), customFormat),
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    })
  );
}

// Transport fichier pour les erreurs
if (process.env.NODE_ENV !== "test") {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Transport fichier pour tous les logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  );
}

// ✅ CORRECTION: Logger principal avec configuration améliorée
export const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format: customFormat,
  transports,
  // ✅ CORRECTION: Gestion des exceptions non capturées
  exceptionHandlers:
    process.env.NODE_ENV !== "test"
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, "exceptions.log"),
            format: customFormat,
          }),
        ]
      : [],
  // ✅ CORRECTION: Gestion des promesses rejetées
  rejectionHandlers:
    process.env.NODE_ENV !== "test"
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, "rejections.log"),
            format: customFormat,
          }),
        ]
      : [],
  exitOnError: false,
});

// ✅ CORRECTION: Logger spécialisé pour l'audit
export const auditLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports:
    process.env.NODE_ENV !== "test"
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, "audit.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 20, // Garder plus d'historique pour l'audit
          }),
        ]
      : [],
});

// ✅ CORRECTION: Logger pour les performances
export const performanceLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports:
    process.env.NODE_ENV !== "test"
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, "performance.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]
      : [],
});

// ✅ CORRECTION: Fonctions utilitaires pour le logging
export const LoggerUtils = {
  // Log d'audit pour les actions importantes
  audit: (action: string, userId?: number, details?: any) => {
    auditLogger.info("Audit event", {
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      ip: details?.ip,
    });
  },

  // Log de performance
  performance: (operation: string, duration: number, details?: any) => {
    performanceLogger.info("Performance metric", {
      operation,
      duration,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  // Log sécurisé (masque les données sensibles)
  secureLog: (level: string, message: string, data?: any) => {
    const sanitizedData = LoggerUtils.sanitizeLogData(data);
    (logger as any)[level](message, sanitizedData);
  },

  // Nettoie les données sensibles avant logging
  sanitizeLogData: (data: any): any => {
    if (!data || typeof data !== "object") return data;

    const sensitiveFields = [
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "secret",
      "apiKey",
      "authorization",
      "cookie",
    ];

    const sanitized = { ...data };

    const recursiveSanitize = (obj: any, path: string = ""): any => {
      if (typeof obj !== "object" || obj === null) return obj;

      for (const key in obj) {
        const fullPath = path ? `${path}.${key}` : key;
        const lowerKey = key.toLowerCase();

        if (sensitiveFields.some((field) => lowerKey.includes(field))) {
          obj[key] = "***MASKED***";
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          obj[key] = recursiveSanitize(obj[key], fullPath);
        }
      }

      return obj;
    };

    return recursiveSanitize(sanitized);
  },

  // Middleware de logging des requêtes HTTP
  httpLogger: (req: any, res: any, responseTime?: number) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      userId: req.user?.userId,
      contentLength: res.get("Content-Length"),
    };

    if (res.statusCode >= 400) {
      logger.warn("HTTP Error", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  },

  // Log les erreurs de base de données
  dbError: (operation: string, error: any, context?: any) => {
    logger.error("Database Error", {
      operation,
      error: {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      context: LoggerUtils.sanitizeLogData(context),
    });
  },

  // Log les tentatives de sécurité suspectes
  securityAlert: (type: string, details: any) => {
    const alertData = {
      type,
      timestamp: new Date().toISOString(),
      severity: "HIGH",
      ...LoggerUtils.sanitizeLogData(details),
    };

    logger.error("Security Alert", alertData);
    auditLogger.error("Security incident", alertData);
  },
};

// ✅ CORRECTION: Configuration pour les tests
if (process.env.NODE_ENV === "test") {
  // Désactiver les logs pendant les tests sauf si explicitement activé
  if (!process.env.ENABLE_TEST_LOGS) {
    logger.transports.forEach((transport) => {
      transport.silent = true;
    });
  }
}

// ✅ CORRECTION: Nettoyage périodique des anciens logs
if (process.env.NODE_ENV === "production") {
  const cleanupOldLogs = () => {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
    const now = Date.now();

    try {
      const files = fs.readdirSync(logsDir);
      files.forEach((file) => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          logger.info(`Ancien fichier de log supprimé: ${file}`);
        }
      });
    } catch (error) {
      logger.error("Erreur lors du nettoyage des logs", { error });
    }
  };

  // Nettoyer les logs une fois par jour
  setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);
}

// Message de démarrage
logger.info("Logger initialisé", {
  environment: process.env.NODE_ENV,
  logLevel: logger.level,
  logsDirectory: logsDir,
});
