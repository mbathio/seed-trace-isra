// backend/src/app.ts - VERSION COMPLÈTE AVEC ROUTE TRACE
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

// Import des routes principales
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import seedLotRoutes from "./routes/seed-lots";
import varietyRoutes from "./routes/varieties";
import multiplierRoutes from "./routes/multipliers";
import parcelRoutes from "./routes/parcels";
import productionRoutes from "./routes/productions";
import qualityControlRoutes from "./routes/quality-controls";
import reportRoutes from "./routes/reports";
import statisticsRoutes from "./routes/statistics";
import exportRoutes from "./routes/export";
import { authMiddleware } from "./middleware/auth"; // ← ton fichier auth.ts

// ✅ Import de la nouvelle route publique pour le QR code
import traceRoutes from "./routes/traceRoutes";

// Middlewares
import { errorHandler } from "./middleware/errorHandler";
import { parseQueryParams } from "./middleware/queryParser";
import { enumTransformMiddleware } from "./middleware/enumTransformMiddleware";

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app: Application = express();

// ====================== CONFIGURATION GLOBALE ======================
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Token-Expired", "X-Total-Count"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(enumTransformMiddleware);

// Logging de développement
if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
}

// Limiteur de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
    data: null,
  },
});

app.use("/api/", limiter);

// ====================== ROUTES PRINCIPALES ======================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Route de santé
app.get("/api/health", (req: Request, res: Response) => {
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

// Routes API principales
// ====================== ROUTES PUBLIQUES ======================
app.use("/api/auth", authRoutes); // 🔓 publique (connexion, inscription, refresh token)
app.use("/trace", traceRoutes); // 🔓 publique (accès QR code sans authentification)
app.use("/api/varieties", varietyRoutes);

// ====================== ROUTES PROTÉGÉES ======================
app.use("/api", authMiddleware); // 🔐 protège toutes les routes ci-dessous

app.use("/api/users", userRoutes);
app.use("/api/seed-lots", seedLotRoutes);
app.use("/api/multipliers", multiplierRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/productions", productionRoutes);
app.use("/api/quality-controls", qualityControlRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/export", exportRoutes);

// ====================== ROUTES SUPPLÉMENTAIRES ======================

// Route racine (informations API)
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🌾 ISRA Seed Trace API",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/api/health",
    endpoints: {
      auth: "/api/auth",
      seedLots: "/api/seed-lots",
      varieties: "/api/varieties",
      multipliers: "/api/multipliers",
      parcels: "/api/parcels",
      productions: "/api/productions",
      qualityControls: "/api/quality-controls",
      reports: "/api/reports",
      statistics: "/api/statistics",
      export: "/api/export",
      trace: "/trace/:id",
    },
  });
});

// Route 404
app.use("/api/*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint non trouvé: ${req.method} ${req.originalUrl}`,
    data: null,
    suggestion: "Vérifiez la documentation des endpoints disponibles à /",
  });
});

// Gestionnaire global d'erreurs
app.use(errorHandler);

// ====================== EXPORT ======================
export default app;
