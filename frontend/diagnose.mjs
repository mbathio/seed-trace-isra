#!/usr/bin/env node
// diagnose.mjs - Script de diagnostic pour le frontend ISRA

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("=== DIAGNOSTIC FRONTEND ISRA ===\n");

// 1. Vérifier les fichiers critiques
console.log("1. Vérification des fichiers critiques:");
const criticalFiles = [
  "src/App.tsx",
  "src/pages/seeds/SeedLots.tsx",
  "src/pages/seeds/SeedLotDetail.tsx",
  "src/pages/seeds/CreateSeedLot.tsx",
  "src/services/api.ts",
  "src/services/seedLotService.ts",
  ".env",
];

criticalFiles.forEach((file) => {
  const exists = fs.existsSync(join(__dirname, file));
  console.log(`   ${file}: ${exists ? "✅" : "❌"}`);
});

// 2. Vérifier les variables d'environnement
console.log("\n2. Variables d'environnement:");
if (fs.existsSync(join(__dirname, ".env"))) {
  const envContent = fs.readFileSync(join(__dirname, ".env"), "utf8");
  const hasApiUrl = envContent.includes("VITE_API_URL");
  console.log(`   VITE_API_URL définie: ${hasApiUrl ? "✅" : "❌"}`);

  if (hasApiUrl) {
    const apiUrl = envContent.match(/VITE_API_URL=(.+)/)?.[1];
    console.log(`   URL API: ${apiUrl}`);
  }
} else {
  console.log("   ❌ Fichier .env manquant!");
}

// 3. Tester la connexion au backend
console.log("\n3. Test de connexion au backend:");
try {
  const response = await axios.get("http://localhost:3001/api/health", {
    timeout: 5000,
  });
  console.log(`   ✅ Backend accessible (status: ${response.status})`);
} catch (error) {
  console.log(`   ❌ Backend inaccessible: ${error.message}`);
  console.log("   Assurez-vous que le backend est démarré avec 'npm run dev'");
}

// 4. Vérifier le contenu de App.tsx
console.log("\n4. Vérification des routes dans App.tsx:");
const appPath = join(__dirname, "src/App.tsx");
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, "utf8");

  const routesToCheck = [
    'path="seed-lots"',
    "element={<SeedLotsPage",
    "import SeedLotsPage",
  ];

  routesToCheck.forEach((route) => {
    const exists = appContent.includes(route);
    console.log(`   ${route}: ${exists ? "✅" : "❌"}`);
  });
}

// 5. Vérifier les dépendances
console.log("\n5. Dépendances critiques:");
const packageJson = JSON.parse(
  fs.readFileSync(join(__dirname, "package.json"), "utf8")
);
const criticalDeps = [
  "react",
  "react-router-dom",
  "@tanstack/react-query",
  "axios",
  "react-hook-form",
  "@radix-ui/react-select",
];

criticalDeps.forEach((dep) => {
  const installed =
    packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  console.log(`   ${dep}: ${installed ? `✅ (${installed})` : "❌"}`);
});

// 6. Recommandations
console.log("\n=== RECOMMANDATIONS ===");
console.log("1. Si le backend n'est pas accessible, démarrez-le:");
console.log("   cd backend && npm run dev");
console.log("\n2. Si des fichiers sont manquants, vérifiez votre repository");
console.log("\n3. Si .env est manquant, créez-le:");
console.log("   cp .env.example .env");
console.log("\n4. Redémarrez le serveur de développement:");
console.log("   npm run dev");
console.log("\n5. Vérifiez la console du navigateur pour plus de détails");
