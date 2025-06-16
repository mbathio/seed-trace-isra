// backend/src/server.ts - Serveur CORRIGÉ avec gestion d'erreurs robuste
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { logger } from "./utils/logger";
import {
  config,
  validateConfig,
  isDevelopment,
  isProduction,
} from "./config/environment";

// ✅ CORRECTION: Charger les variables d'environnement EN PREMIER
dotenv.config();

// ✅ CORRECTION: Validation de configuration non bloquante
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

// ✅ CORRECTION: Créer le serveur HTTP avec gestion d'erreur
let server: http.Server;

try {
  server = http.createServer(app);
  logger.info("✅ Serveur HTTP créé avec succès");
} catch (error: any) {
  logger.error("❌ Erreur lors de la création du serveur HTTP:", error);
  process.exit(1);
}

// ✅ CORRECTION: Configuration Socket.IO avec gestion d'erreur
let io: SocketIOServer;

try {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.client.url,
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"],
  });

  // Gestionnaire Socket.IO
  io.on("connection", (socket) => {
    logger.debug(`Nouveau client connecté: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      logger.debug(`Client déconnecté: ${socket.id}, raison: ${reason}`);
    });

    socket.on("error", (error) => {
      logger.error(`Erreur Socket.IO pour ${socket.id}:`, error);
    });
  });

  logger.info("✅ Socket.IO configuré avec succès");
} catch (error: any) {
  logger.error("❌ Erreur lors de la configuration de Socket.IO:", error);
  // Continuer sans Socket.IO en cas d'erreur
}

// ✅ CORRECTION: Fonction pour tester si le port est disponible
function testPortAvailability(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require("net");
    const testServer = net.createServer();

    testServer.listen(port, host, () => {
      testServer.close(() => {
        resolve(true);
      });
    });

    testServer.on("error", () => {
      resolve(false);
    });
  });
}

// ✅ CORRECTION: Fonction pour démarrer le serveur avec gestion d'erreurs robuste
const startServer = async (): Promise<void> => {
  try {
    logger.info("🚀 Démarrage du serveur ISRA Seed Trace...");

    // ✅ CORRECTION: Vérifier que le port est disponible
    logger.info(`🔍 Vérification de la disponibilité du port ${PORT}...`);
    const isPortAvailable = await testPortAvailability(PORT, HOST);

    if (!isPortAvailable) {
      throw new Error(`Port ${PORT} déjà utilisé sur ${HOST}`);
    }

    logger.info(`✅ Port ${PORT} disponible`);

    // ✅ CORRECTION: Connexion à la base de données avec retry et timeout
    logger.info("🔗 Connexion à la base de données...");
    let dbConnected = false;
    let retries = 3;

    while (!dbConnected && retries > 0) {
      try {
        // Timeout de 10 secondes pour la connexion DB
        const dbPromise = connectDatabase();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout de connexion DB")), 10000)
        );

        await Promise.race([dbPromise, timeoutPromise]);

        logger.info("✅ Connexion à la base de données établie");
        dbConnected = true;
      } catch (error: any) {
        retries--;
        logger.warn(`❌ Tentative de connexion DB échouée: ${error.message}`);
        logger.warn(`Tentatives restantes: ${retries}`);

        if (retries > 0) {
          logger.info("⏳ Attente avant nouvelle tentative...");
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Attendre 2s
        } else {
          // En développement, permettre de continuer sans DB pour debug
          if (isDevelopment()) {
            logger.warn("⚠️  Continuation sans DB en mode développement");
            break;
          } else {
            throw new Error(
              `Impossible de se connecter à la base de données après 3 tentatives: ${error.message}`
            );
          }
        }
      }
    }

    // ✅ CORRECTION: Démarrer le serveur avec gestion d'erreurs détaillées
    logger.info(`🚀 Démarrage du serveur sur ${HOST}:${PORT}...`);

    server.listen(PORT, HOST, () => {
      logger.info("🎉 Serveur démarré avec succès!");
      logger.info(`📍 URL: http://${HOST}:${PORT}`);
      logger.info(`📝 Environnement: ${config.environment}`);
      logger.info(`🔗 CORS activé pour: ${config.client.url}`);
      logger.info(`🔐 JWT configuré avec expiration: ${config.jwt.expiresIn}`);
      logger.info(
        `📁 Upload max: ${Math.round(
          config.upload.maxFileSize / 1024 / 1024
        )}MB`
      );
      logger.info(`📊 Log level: ${config.logging.level}`);

      if (isDevelopment()) {
        logger.info("🛠️  Mode développement activé");
        logger.info(`📚 API disponible sur: http://${HOST}:${PORT}/api`);
        logger.info(`❤️  Health check: http://${HOST}:${PORT}/api/health`);
        logger.info(`🌱 Seed lots: http://${HOST}:${PORT}/api/seed-lots`);
        logger.info(`👤 Auth: http://${HOST}:${PORT}/api/auth/login`);
      }

      // Afficher des informations de débogage utiles
      logger.debug("🔧 Configuration du serveur:", {
        port: PORT,
        host: HOST,
        environment: config.environment,
        databaseConnected: dbConnected,
        jwtConfigured: !!config.jwt.secret,
        corsOrigin: config.client.url,
      });
    });

    // ✅ CORRECTION: Gestion détaillée des erreurs de serveur
    server.on("error", (error: any) => {
      logger.error("❌ Erreur du serveur HTTP:", error);

      if (error.code === "EADDRINUSE") {
        logger.error(`❌ Le port ${PORT} est déjà utilisé`);
        logger.info("💡 Solutions possibles:");
        logger.info(`   • Changez le PORT dans .env (ex: PORT=3002)`);
        logger.info(`   • Arrêtez le processus utilisant le port ${PORT}`);
        logger.info(
          `   • Utilisez 'netstat -ano | findstr :${PORT}' pour identifier le processus`
        );
      } else if (error.code === "EACCES") {
        logger.error(`❌ Permission refusée pour le port ${PORT}`);
        logger.info(
          "💡 Essayez un port > 1024 ou lancez en tant qu'administrateur"
        );
      } else if (error.code === "ENOTFOUND") {
        logger.error(`❌ Host non trouvé: ${HOST}`);
        logger.info("💡 Vérifiez la variable HOST dans .env");
      } else {
        logger.error("❌ Erreur serveur inconnue:", {
          code: error.code,
          message: error.message,
          stack: isDevelopment() ? error.stack : undefined,
        });
      }

      process.exit(1);
    });

    // ✅ CORRECTION: Gestion des timeouts et connexions
    server.timeout = 30000; // 30 secondes timeout
    server.keepAliveTimeout = 5000; // 5 secondes keep-alive
    server.headersTimeout = 6000; // 6 secondes headers timeout
  } catch (error: any) {
    logger.error("❌ Erreur fatale lors du démarrage du serveur:", {
      message: error.message,
      stack: isDevelopment() ? error.stack : undefined,
      code: error.code,
    });

    // ✅ CORRECTION: Messages d'aide spécifiques selon l'erreur
    if (error.message.includes("DATABASE_URL")) {
      logger.error("💡 Problème de base de données:");
      logger.error("   • Vérifiez que PostgreSQL est démarré");
      logger.error("   • Vérifiez DATABASE_URL dans .env");
      logger.error("   • Testez avec: npx prisma db push");
    }

    if (error.message.includes("JWT_SECRET")) {
      logger.error("💡 Problème JWT:");
      logger.error("   • Vérifiez que JWT_SECRET est défini dans .env");
      logger.error("   • JWT_SECRET doit faire au moins 32 caractères");
    }

    if (
      error.message.includes("Port") ||
      error.message.includes("EADDRINUSE")
    ) {
      logger.error("💡 Problème de port:");
      logger.error(`   • Le port ${PORT} est peut-être déjà utilisé`);
      logger.error("   • Changez PORT dans .env (ex: PORT=3002)");
      logger.error(`   • Ou arrêtez le processus utilisant le port ${PORT}`);
    }

    if (error.message.includes("Timeout")) {
      logger.error("💡 Problème de timeout:");
      logger.error("   • La base de données met trop de temps à répondre");
      logger.error("   • Vérifiez que PostgreSQL est accessible");
      logger.error("   • Vérifiez la configuration réseau");
    }

    process.exit(1);
  }
};

// ✅ CORRECTION: Gestion gracieuse de l'arrêt avec timeout
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} reçu. Arrêt gracieux du serveur...`);

  // Timeout pour forcer l'arrêt si nécessaire
  const forceShutdownTimeout = setTimeout(() => {
    logger.error("❌ Arrêt forcé après timeout de 15 secondes");
    process.exit(1);
  }, 15000);

  try {
    // Arrêter d'accepter de nouvelles connexions
    server.close(async () => {
      logger.info("✅ Serveur HTTP fermé");

      try {
        // Fermer la base de données
        await disconnectDatabase();
        logger.info("✅ Connexions à la base de données fermées");
      } catch (error) {
        logger.warn("⚠️  Erreur lors de la fermeture de la DB:", error);
      }

      try {
        // Fermer Socket.IO
        if (io) {
          io.close();
          logger.info("✅ Socket.IO fermé");
        }
      } catch (error) {
        logger.warn("⚠️  Erreur lors de la fermeture de Socket.IO:", error);
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

// ✅ CORRECTION: Gestion améliorée des erreurs non capturées
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("UNHANDLED PROMISE REJECTION! 💥", {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString().substring(0, 100) + "...",
  });

  // En développement, ne pas arrêter immédiatement pour le debug
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

// ✅ CORRECTION: Gestion des signaux d'arrêt
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Gestion spécifique Windows
if (process.platform === "win32") {
  process.on("SIGBREAK", () => gracefulShutdown("SIGBREAK"));
}

// ✅ CORRECTION: Démarrer le serveur avec gestion d'erreurs finale
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
  console.error("\n🔧 Commandes de diagnostic:");
  console.error("   • npm install");
  console.error("   • npx prisma db push");
  console.error("   • node diagnose.js");

  process.exit(1);
});

// ✅ CORRECTION: Log de démarrage du processus
logger.info("📋 Processus de démarrage initialisé", {
  pid: process.pid,
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  env: config.environment,
  memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
});
