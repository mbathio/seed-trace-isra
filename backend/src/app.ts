import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

// Import des routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import seedRoutes from "./routes/seedLots";
// ... autres imports de routes

// Import des middlewares
import { errorHandler } from "./middleware/errorHandler";

// Charger les variables d'environnement
dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
  }

  private configureMiddlewares(): void {
    // Configuration CORS corrigée
    const corsOptions = {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Token-Expired", "X-Total-Count"],
      maxAge: 86400, // 24 heures
    };

    // Appliquer les middlewares
    this.app.use(cors(corsOptions));
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );
    this.app.use(compression());
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Logging en développement
    if (process.env.NODE_ENV !== "production") {
      this.app.use(morgan("dev"));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limite de 100 requêtes
      message:
        "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
    });
    this.app.use("/api/", limiter);

    // Servir les fichiers statiques (uploads)
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../uploads"))
    );
  }

  private configureRoutes(): void {
    // Route de santé
    this.app.get("/api/health", (req: Request, res: Response) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // Routes API
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/seeds", seedRoutes);
    // ... autres routes

    // Route de base
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "ISRA Seed Trace API",
        version: "1.0.0",
        documentation: "/api/docs",
      });
    });
  }

  // Méthode pour obtenir l'application Express
  public getApp(): Application {
    return this.app;
  }
}

export default new App().getApp();
