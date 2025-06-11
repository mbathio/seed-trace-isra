import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database"; // ✅ CORRECTION: Import de disconnectDatabase
import { logger } from "./utils/logger";

// Charger les variables d'environnement
dotenv.config();

// Configuration du serveur
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";
const isProduction = process.env.NODE_ENV === "production";

// Créer le serveur HTTP
const server = http.createServer(app);

// Configuration Socket.IO (si nécessaire)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Gestionnaire Socket.IO
io.on("connection", (socket) => {
  logger.info(`Nouveau client connecté: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`Client déconnecté: ${socket.id}`);
  });

  // Ajouter d'autres événements Socket.IO si nécessaire
});

// Fonction pour démarrer le serveur
const startServer = async (): Promise<void> => {
  try {
    // ✅ CORRECTION: Connexion à la base de données
    await connectDatabase();
    logger.info("✅ Connexion à la base de données établie");

    // Démarrer le serveur
    server.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur http://${HOST}:${PORT}`);
      logger.info(`📝 Environnement: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `🔗 CORS activé pour: ${process.env.CLIENT_URL || "http://localhost:5173"}`
      );
      logger.info(
        `🔐 JWT configuré avec expiration: ${process.env.JWT_ACCESS_EXPIRY || "15m"}`
      );

      if (!isProduction) {
        logger.info(
          `📚 Documentation API disponible sur: http://${HOST}:${PORT}/api/docs`
        );
      }
    });
  } catch (error) {
    logger.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! 💥 Arrêt du serveur...", err);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...", err);
  server.close(() => {
    process.exit(1);
  });
});

// Gestion gracieuse de l'arrêt
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} reçu. Arrêt gracieux du serveur...`);

  server.close(async () => {
    logger.info("Serveur HTTP fermé");

    try {
      // ✅ CORRECTION: Fermer les connexions à la base de données
      await disconnectDatabase();
      logger.info("Connexions à la base de données fermées");

      // Fermer d'autres ressources si nécessaire
      io.close();

      logger.info("Arrêt complet du serveur");
      process.exit(0);
    } catch (error) {
      logger.error("Erreur lors de l'arrêt:", error);
      process.exit(1);
    }
  });

  // Force l'arrêt après 10 secondes
  setTimeout(() => {
    logger.error("Arrêt forcé après timeout");
    process.exit(1);
  }, 10000);
};

// Écouter les signaux d'arrêt
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ✅ CORRECTION: Démarrer le serveur
startServer().catch((error) => {
  logger.error("Erreur fatale lors du démarrage:", error);
  process.exit(1);
});
