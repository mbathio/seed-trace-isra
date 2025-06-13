// backend/src/test-server.ts
import express from "express";
import dotenv from "dotenv";

console.log("=== DÉMARRAGE TEST SERVEUR ===");

// 1. Charger les variables d'environnement
console.log("1. Chargement des variables d'environnement...");
dotenv.config();
console.log("   ✓ dotenv chargé");

// 2. Créer l'application Express
console.log("2. Création de l'application Express...");
const app = express();
console.log("   ✓ Express créé");

// 3. Middleware basique
console.log("3. Configuration des middlewares...");
app.use(express.json());
console.log("   ✓ Middlewares configurés");

// 4. Route de test
app.get("/", (req, res) => {
  res.json({
    message: "Serveur de test fonctionne!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    env: process.env.NODE_ENV || "non défini",
    port: process.env.PORT || "3001",
  });
});

// 5. Démarrer le serveur
console.log("4. Démarrage du serveur...");
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";

try {
  const server = app.listen(PORT, () => {
    console.log(`   ✓ Serveur démarré sur http://${HOST}:${PORT}`);
    console.log("   → Testez: http://localhost:" + PORT);
    console.log("   → Health: http://localhost:" + PORT + "/api/health");
    console.log("\n=== SERVEUR PRÊT ===");
    console.log("Appuyez sur Ctrl+C pour arrêter\n");
  });

  server.on("error", (error: any) => {
    console.error("ERREUR SERVEUR:", error.message);
    if (error.code === "EADDRINUSE") {
      console.error(`Le port ${PORT} est déjà utilisé!`);
    }
    process.exit(1);
  });
} catch (error) {
  console.error("ERREUR FATALE:", error);
  process.exit(1);
}

// Garder le processus actif
process.on("SIGINT", () => {
  console.log("\nArrêt du serveur...");
  process.exit(0);
});
