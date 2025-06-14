// backend/src/start-debug.ts
console.log("🔍 DEBUG: Démarrage avec traçage détaillé...\n");

// Tracer chaque import
console.log("1. Import dotenv...");
import dotenv from "dotenv";
dotenv.config();
console.log("   ✓ dotenv chargé");

console.log("\n2. Import http...");
import http from "http";
console.log("   ✓ http chargé");

console.log("\n3. Import express...");
import express from "express";
console.log("   ✓ express chargé");

console.log("\n4. Création app Express de base...");
const app = express();
app.use(express.json());
app.get("/test", (req, res) => res.json({ status: "ok" }));
console.log("   ✓ app créée");

console.log("\n5. Import de la config database...");
try {
  const { connectDatabase } = require("./config/database");
  console.log("   ✓ database config chargée");

  console.log("\n6. Test connexion DB...");
  connectDatabase()
    .then(() => console.log("   ✓ DB connectée"))
    .catch((err: any) => console.log("   ✗ Erreur DB:", err.message));
} catch (error: any) {
  console.log("   ✗ Erreur import database:", error.message);
}

console.log("\n7. Import logger...");
try {
  const { logger } = require("./utils/logger");
  console.log("   ✓ logger chargé");
} catch (error: any) {
  console.log("   ✗ Erreur import logger:", error.message);
}

console.log("\n8. Import config environment...");
try {
  const { config } = require("./config/environment");
  console.log("   ✓ config chargée");
  console.log("   PORT:", config.server.port);
} catch (error: any) {
  console.log("   ✗ Erreur import config:", error.message);
}

console.log("\n9. Tentative d'import app complète...");
try {
  console.log("   Chargement de app.ts...");
  const mainApp = require("./app");
  console.log("   ✓ app.ts chargée");
  console.log("   Type:", typeof mainApp);
  console.log("   Default export:", typeof mainApp.default);
} catch (error: any) {
  console.log("   ✗ ERREUR import app.ts:");
  console.log("   ", error.message);
  console.log("   Stack:", error.stack?.split("\n").slice(0, 5).join("\n"));
}

console.log("\n10. Démarrage serveur minimal...");
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`\n✅ Serveur de debug démarré sur le port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/test`);
  console.log("\nLe problème semble être dans l'import de app.ts");
  console.log(
    "Vérifiez les erreurs ci-dessus pour identifier le module qui bloque."
  );
});

server.on("error", (error: any) => {
  console.error("❌ Erreur serveur:", error.message);
  process.exit(1);
});
