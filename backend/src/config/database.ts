// backend/src/config/database.ts
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/**/*.{ts,js}"],
  migrations: ["src/migrations/**/*.{ts,js}"],
  subscribers: ["src/subscribers/**/*.{ts,js}"],
});

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
  try {
    await prisma.$connect();
    logger.info("Connexion à la base de données établie");
  } catch (error) {
    logger.error("Erreur de connexion à la base de données:", error);
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
