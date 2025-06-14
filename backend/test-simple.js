// backend/test-simple.js
// Serveur de test ultra-minimal pour diagnostiquer le problème

console.log("=== TEST SERVEUR MINIMAL ===");

// 1. Charger dotenv
require("dotenv").config();
console.log("✓ Variables d'environnement chargées");
console.log("  PORT:", process.env.PORT || "3001");
console.log("  NODE_ENV:", process.env.NODE_ENV || "development");

// 2. Créer serveur Express basique
const express = require("express");
const app = express();
console.log("✓ Express créé");

// 3. Route de test
app.get("/", (req, res) => {
  res.json({ message: "Serveur fonctionne!", timestamp: new Date() });
});

// 4. Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Serveur démarré sur http://localhost:${PORT}`);
  console.log("\n=== SERVEUR PRÊT ===");
  console.log("Testez: http://localhost:" + PORT);
  console.log("Ctrl+C pour arrêter\n");
});
