// diagnose.mjs - Script de diagnostic pour le frontend
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtenir le répertoire actuel en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== DIAGNOSTIC DU FRONTEND ===\n");

// 1. Vérifier le fichier App.tsx
console.log("1. Vérification du fichier App.tsx:");
const appPath = path.join(__dirname, "src", "App.tsx");
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, "utf8");
  console.log("✅ App.tsx existe");

  // Vérifier les imports
  const hasQRCodeRoute = appContent.includes('"/seed-lots/:id/qr-code"');
  const hasCreateSeedLotRoute = appContent.includes('path="seed-lots/create"');
  const hasSeedLotDetailRoute = appContent.includes('path="seed-lots/:id"');

  console.log(
    `   - Route QR Code: ${
      hasQRCodeRoute
        ? "❌ TROUVÉE (devrait être supprimée)"
        : "✅ Non trouvée (correct)"
    }`
  );
  console.log(
    `   - Route CreateSeedLot: ${hasCreateSeedLotRoute ? "✅" : "❌"}`
  );
  console.log(
    `   - Route SeedLotDetail: ${hasSeedLotDetailRoute ? "✅" : "❌"}`
  );
} else {
  console.log("❌ App.tsx n'existe pas!");
}

// 2. Vérifier le fichier CreateSeedLot
console.log("\n2. Vérification du fichier CreateSeedLot.tsx:");
const createPath = path.join(
  __dirname,
  "src",
  "pages",
  "seeds",
  "CreateSeedLot.tsx"
);
if (fs.existsSync(createPath)) {
  const createContent = fs.readFileSync(createPath, "utf8");
  console.log("✅ CreateSeedLot.tsx existe");

  // Vérifier les imports et la structure
  const hasReactImport = createContent.includes("import React");
  const hasApiImport = createContent.includes('from "../../services/api"');
  const hasFormSubmit = createContent.includes("onSubmit");
  const hasNavigation = createContent.includes("navigate");

  console.log(`   - Import React: ${hasReactImport ? "✅" : "❌"}`);
  console.log(`   - Import API: ${hasApiImport ? "✅" : "❌"}`);
  console.log(`   - Gestion du formulaire: ${hasFormSubmit ? "✅" : "❌"}`);
  console.log(`   - Navigation: ${hasNavigation ? "✅" : "❌"}`);
} else {
  console.log("❌ CreateSeedLot.tsx n'existe pas!");
}

// 3. Vérifier les autres pages de seed
console.log("\n3. Vérification des autres pages seed:");
const seedPages = ["SeedLots.tsx", "SeedLotDetail.tsx"];
const seedsDir = path.join(__dirname, "src", "pages", "seeds");

seedPages.forEach((page) => {
  const pagePath = path.join(seedsDir, page);
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${page} existe`);
    const content = fs.readFileSync(pagePath, "utf8");

    // Vérifier si le fichier exporte un composant par défaut
    const hasDefaultExport = content.includes("export default");
    console.log(`   - Export par défaut: ${hasDefaultExport ? "✅" : "❌"}`);
  } else {
    console.log(`❌ ${page} n\'existe pas!`);
  }
});

// 4. Vérifier la structure des dossiers
console.log("\n4. Structure des dossiers:");
const dirsToCheck = [
  "src/pages/seeds",
  "src/pages/varieties",
  "src/pages/multipliers",
  "src/pages/quality",
  "src/pages/productions",
  "src/pages/parcels",
  "src/services",
  "src/components/ui",
  "src/types",
];

dirsToCheck.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    console.log(`✅ ${dir} (${files.length} fichiers)`);
  } else {
    console.log(`❌ ${dir} manquant!`);
  }
});

// 5. Vérifier les routes dans App.tsx
console.log("\n5. Analyse détaillée des routes:");
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, "utf8");

  // Extraire toutes les routes
  const routePattern = /path="([^"]+)"/g;
  const routes = [];
  let match;

  while ((match = routePattern.exec(appContent)) !== null) {
    routes.push(match[1]);
  }

  console.log(`Nombre total de routes: ${routes.length}`);

  // Vérifier les routes importantes
  const importantRoutes = [
    "/dashboard",
    "/dashboard/seed-lots",
    "/dashboard/seed-lots/create",
    "/dashboard/seed-lots/:id",
    "/dashboard/varieties",
    "/dashboard/multipliers",
    "/dashboard/quality-controls",
    "/dashboard/productions",
    "/dashboard/parcels",
  ];

  importantRoutes.forEach((route) => {
    const exists = routes.includes(route);
    console.log(`   ${route}: ${exists ? "✅" : "❌"}`);
  });
}

// 6. Vérifier les imports de composants dans App.tsx
console.log("\n6. Vérification des imports dans App.tsx:");
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, "utf8");

  const importChecks = [
    { name: "CreateSeedLotPage", pattern: /import\s+CreateSeedLotPage\s+from/ },
    { name: "SeedLotsPage", pattern: /import\s+SeedLotsPage\s+from/ },
    {
      name: "SeedLotDetailsPage",
      pattern: /import\s+SeedLotDetailsPage\s+from/,
    },
    {
      name: "CreateSeedLot",
      pattern: /import\s+CreateSeedLot\s+from.*CreateSeedLot/,
    },
    { name: "SeedLots", pattern: /import\s+SeedLots\s+from.*SeedLots/ },
    {
      name: "SeedLotDetail",
      pattern: /import\s+SeedLotDetail\s+from.*SeedLotDetail/,
    },
  ];

  importChecks.forEach(({ name, pattern }) => {
    const hasImport = pattern.test(appContent);
    console.log(`   Import ${name}: ${hasImport ? "✅" : "❌"}`);
  });
}

// 7. Recommandations
console.log("\n=== RECOMMANDATIONS ===");
console.log(
  "1. Assurez-vous que tous les composants de pages exportent un composant par défaut"
);
console.log(
  "2. Vérifiez que les imports dans App.tsx correspondent aux noms des composants"
);
console.log(
  "3. Les routes doivent utiliser le préfixe /dashboard pour les pages protégées"
);
console.log(
  "4. Supprimez toute référence à la route QR Code si elle existe encore"
);

console.log("\n=== FIN DU DIAGNOSTIC ===");
