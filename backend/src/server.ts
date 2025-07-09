// backend/src/server-no-socketio.ts - Serveur sans Socket.io pour éviter les erreurs
import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { logger } from "./utils/logger";
import {
  config,
  validateConfig,
  isDevelopment,
  isProduction,
} from "./config/environment";

// Charger les variables d'environnement EN PREMIER
dotenv.config();

// Validation de configuration non bloquante
console.log("🔧 Validation de la configuration...");
const configValidation = validateConfig();

if (!configValidation.isValid && isProduction()) {
  console.error("❌ Configuration invalide en production");
  process.exit(1);
}

if (!configValidation.isValid && isDevelopment()) {
  console.warn(
    "⚠️  Configuration avec avertissements en développement - continuation"
  );
}

// Configuration du serveur
const PORT = config.server.port;
const HOST = config.server.host;

// Créer le serveur HTTP
let server: http.Server;

try {
  server = http.createServer(app);
  logger.info("✅ Serveur HTTP créé avec succès");
} catch (error: any) {
  logger.error("❌ Erreur lors de la création du serveur HTTP:", error);
  process.exit(1);
}

// Fonction pour démarrer le serveur
const startServer = async (): Promise<void> => {
  try {
    logger.info("🚀 Démarrage du serveur ISRA Seed Trace...");

    // Connexion à la base de données
    logger.info("🔗 Connexion à la base de données...");
    try {
      await connectDatabase();
      logger.info("✅ Connexion à la base de données établie");
    } catch (error: any) {
      logger.warn("⚠️  Erreur de connexion DB:", error.message);
      if (isDevelopment()) {
        logger.warn("⚠️  Continuation sans DB en mode développement");
      } else {
        throw error;
      }
    }

    // Démarrer le serveur
    logger.info(`🚀 Démarrage du serveur sur ${HOST}:${PORT}...`);

    server.listen(PORT, HOST, () => {
      logger.info("🎉 Serveur démarré avec succès!");
      logger.info(`📍 URL: http://${HOST}:${PORT}`);
      logger.info(`📝 Environnement: ${config.environment}`);
      logger.info(`🔗 CORS activé pour: ${config.client.url}`);
      logger.info(`🔐 JWT configuré avec expiration: ${config.jwt.expiresIn}`);

      if (isDevelopment()) {
        logger.info("🛠️  Mode développement activé");
        logger.info(`📚 API disponible sur: http://${HOST}:${PORT}/api`);
        logger.info(`❤️  Health check: http://${HOST}:${PORT}/api/health`);
        logger.info(`🌱 Seed lots: http://${HOST}:${PORT}/api/seed-lots`);
        logger.info(`👤 Auth: http://${HOST}:${PORT}/api/auth/login`);
      }
    });

    // Gestion des erreurs du serveur
    server.on("error", (error: any) => {
      logger.error("❌ Erreur du serveur HTTP:", error);

      if (error.code === "EADDRINUSE") {
        logger.error(`❌ Le port ${PORT} est déjà utilisé`);
        logger.info("💡 Solutions possibles:");
        logger.info(`   • Changez le PORT dans .env (ex: PORT=3002)`);
        logger.info(`   • Arrêtez le processus utilisant le port ${PORT}`);
      } else if (error.code === "EACCES") {
        logger.error(`❌ Permission refusée pour le port ${PORT}`);
        logger.info(
          "💡 Essayez un port > 1024 ou lancez en tant qu'administrateur"
        );
      }

      process.exit(1);
    });

    // Configuration des timeouts
    server.timeout = 30000; // 30 secondes
    server.keepAliveTimeout = 5000; // 5 secondes
    server.headersTimeout = 6000; // 6 secondes
  } catch (error: any) {
    logger.error("❌ Erreur fatale lors du démarrage du serveur:", {
      message: error.message,
      stack: isDevelopment() ? error.stack : undefined,
    });
    process.exit(1);
  }
};

// Gestion gracieuse de l'arrêt
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} reçu. Arrêt gracieux du serveur...`);

  const forceShutdownTimeout = setTimeout(() => {
    logger.error("❌ Arrêt forcé après timeout de 15 secondes");
    process.exit(1);
  }, 15000);

  try {
    server.close(async () => {
      logger.info("✅ Serveur HTTP fermé");

      try {
        await disconnectDatabase();
        logger.info("✅ Connexions à la base de données fermées");
      } catch (error) {
        logger.warn("⚠️  Erreur lors de la fermeture de la DB:", error);
      }

      clearTimeout(forceShutdownTimeout);
      logger.info("🏁 Arrêt complet du serveur");
      process.exit(0);
    });
  } catch (error) {
    logger.error("❌ Erreur lors de l'arrêt gracieux:", error);
    clearTimeout(forceShutdownTimeout);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("UNHANDLED PROMISE REJECTION! 💥", {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });

  if (isDevelopment()) {
    logger.warn("⚠️  Continuation en mode développement malgré la rejection");
  } else {
    logger.error(
      "🚨 Arrêt du serveur à cause d'une Promise rejection non gérée"
    );
    server.close(() => {
      process.exit(1);
    });
  }
});

process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥", {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  logger.error(
    "🚨 Arrêt immédiat du serveur à cause d'une exception non gérée"
  );
  process.exit(1);
});

// Gestion des signaux d'arrêt
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Gestion spécifique Windows
if (process.platform === "win32") {
  process.on("SIGBREAK", () => gracefulShutdown("SIGBREAK"));
}

// Démarrer le serveur
console.log("🌾 ISRA Seed Trace - Système de traçabilité des semences");
console.log("======================================================");

startServer().catch((error) => {
  console.error("💥 ERREUR FATALE lors du démarrage:", error.message);

  if (isDevelopment()) {
    console.error("📋 Stack trace complète:");
    console.error(error.stack);
  }

  console.error("\n💡 Vérifications recommandées:");
  console.error("   1. PostgreSQL est-il démarré ?");
  console.error("   2. Le fichier .env existe-t-il ?");
  console.error("   3. DATABASE_URL est-elle correcte ?");
  console.error("   4. Le port 3001 est-il libre ?");
  console.error("   5. Toutes les dépendances sont-elles installées ?");

  process.exit(1);
});

// Log de démarrage
logger.info("📋 Processus de démarrage initialisé", {
  pid: process.pid,
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  env: config.environment,
  memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
});
