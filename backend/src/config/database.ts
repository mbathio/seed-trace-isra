// backend/src/config/database.ts (corrigé)
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    logger.debug("Query: " + e.query);
    logger.debug("Params: " + e.params);
    logger.debug("Duration: " + e.duration + "ms");
  });
}

prisma.$on("error", (e) => {
  logger.error("Database error:", e);
});

export async function connectDatabase() {
  logger.info("🧠 Tentative de connexion à la base de données PostgreSQL...");

  const timeout = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            "⏳ Timeout: impossible de se connecter à la base après 10 secondes"
          )
        ),
      10000
    )
  );

  try {
    await Promise.race([prisma.$connect(), timeout]);
    logger.info("✅ Connexion à la base de données établie avec succès");
  } catch (error: any) {
    logger.error("❌ Erreur de connexion à la base de données:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info("Connexion à la base de données fermée");
  } catch (error) {
    logger.error("Erreur lors de la fermeture de la connexion:", error);
  }
}

export { prisma };
