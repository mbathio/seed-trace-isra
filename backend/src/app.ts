// backend/src/app.ts - VERSION CORRIGÉE
import express, { Express, Request, Response, NextFunction } from "express"; // ✅ CORRECTION: Express au lieu d'Application
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

// Import des routes - ✅ CORRECTION: Noms de fichiers standardisés
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import seedLotRoutes from "./routes/seed-lots"; // ✅ CORRIGÉ: kebab-case
import varietyRoutes from "./routes/varieties";
import multiplierRoutes from "./routes/multipliers";
import parcelRoutes from "./routes/parcels";
import productionRoutes from "./routes/productions";
import qualityControlRoutes from "./routes/quality-controls"; // ✅ CORRIGÉ: kebab-case
import reportRoutes from "./routes/reports";
import statisticsRoutes from "./routes/statistics";
import exportRoutes from "./routes/export";

// Import des middlewares
import { errorHandler } from "./middleware/errorHandler";

// Charger les variables d'environnement
dotenv.config();

class App {
  public app: Express; // ✅ CORRECTION: Express au lieu d'Application

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    // Configuration CORS
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
      message: {
        success: false,
        message:
          "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
        data: null,
      },
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
        version: "1.0.0",
        services: {
          database: "connected",
          api: "running",
        },
      });
    });

    // ✅ CORRECTION: Routes API uniformisées avec kebab-case
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/seed-lots", seedLotRoutes); // ✅ CORRIGÉ: kebab-case consistant
    this.app.use("/api/varieties", varietyRoutes);
    this.app.use("/api/multipliers", multiplierRoutes);
    this.app.use("/api/parcels", parcelRoutes);
    this.app.use("/api/productions", productionRoutes);
    this.app.use("/api/quality-controls", qualityControlRoutes); // ✅ CORRIGÉ: kebab-case consistant
    this.app.use("/api/reports", reportRoutes);
    this.app.use("/api/statistics", statisticsRoutes);
    this.app.use("/api/export", exportRoutes);

    // Route de base avec documentation des endpoints corrigés
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "🌾 ISRA Seed Trace API",
        version: "1.0.0",
        documentation: "/api/docs",
        health: "/api/health",
        endpoints: {
          auth: "/api/auth",
          seedLots: "/api/seed-lots", // ✅ CORRIGÉ: kebab-case
          varieties: "/api/varieties",
          multipliers: "/api/multipliers",
          parcels: "/api/parcels",
          productions: "/api/productions",
          qualityControls: "/api/quality-controls", // ✅ CORRIGÉ: kebab-case
          reports: "/api/reports",
          statistics: "/api/statistics",
          export: "/api/export",
        },
      });
    });

    // Route 404 pour les endpoints API non trouvés
    this.app.use("/api/*", (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: `Endpoint non trouvé: ${req.method} ${req.originalUrl}`,
        data: null,
        suggestion: "Vérifiez la documentation des endpoints disponibles à /",
      });
    });
  }

  private configureErrorHandling(): void {
    // Gestionnaire d'erreurs global
    this.app.use(errorHandler);
  }

  // Méthode pour obtenir l'application Express
  public getApp(): Express { // ✅ CORRECTION: Express au lieu d'Application
    return this.app;
  }
}

export default new App().getApp();