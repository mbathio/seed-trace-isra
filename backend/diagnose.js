// diagnose.js - Script de diagnostic amélioré
const fs = require("fs");
const path = require("path");

console.log("🔍 DIAGNOSTIC DU SYSTÈME ISRA SEED TRACE");
console.log("==========================================\n");

// 1. Versions
console.log("1️⃣ VERSION NODE.JS:");
console.log(`   Node: ${process.version}`);
console.log(`   NPM: ${process.env.npm_version || "N/A"}\n`);

// 2. Vérifier les fichiers essentiels
console.log("2️⃣ FICHIERS ESSENTIELS:");
const requiredFiles = [
  ".env",
  "package.json",
  "tsconfig.json",
  "src/server.ts",
  "src/app.ts",
  "prisma/schema.prisma",
];

requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? "✅" : "❌"} ${file}`);
});

// 3. Variables d'environnement
console.log("\n3️⃣ VARIABLES D'ENVIRONNEMENT:");
require("dotenv").config();

const envVars = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];
envVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes("SECRET") || varName.includes("PASSWORD")) {
      console.log(`   ✅ ${varName}: ****** (défini)`);
    } else {
      console.log(`   ✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`   ❌ ${varName}: NON DÉFINI`);
  }
});

// 4. Test de la base de données avec Prisma
console.log("\n4️⃣ TEST CONNEXION POSTGRESQL:");
async function testDatabase() {
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    // Test de connexion
    await prisma.$connect();
    console.log("   ✅ Connexion à PostgreSQL réussie");

    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`   ✅ Nombre d'utilisateurs: ${userCount}`);

    // Compter les variétés
    const varietyCount = await prisma.variety.count();
    console.log(`   ✅ Nombre de variétés: ${varietyCount}`);

    // Compter les lots
    const seedLotCount = await prisma.seedLot.count();
    console.log(`   ✅ Nombre de lots: ${seedLotCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
  }
}

// 5. Dépendances
console.log("\n5️⃣ DÉPENDANCES INSTALLÉES:");
try {
  const packageJson = require("./package.json");
  const deps = Object.keys(packageJson.dependencies || {});
  console.log(`   ✅ ${deps.length} dépendances installées`);

  // Vérifier les dépendances critiques
  const criticalDeps = [
    "express",
    "@prisma/client",
    "jsonwebtoken",
    "bcryptjs",
    "cors",
  ];
  criticalDeps.forEach((dep) => {
    if (deps.includes(dep)) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} MANQUANT`);
    }
  });
} catch (error) {
  console.log("   ❌ Erreur lors de la lecture de package.json");
}

// 6. Structure des dossiers
console.log("\n6️⃣ STRUCTURE DES DOSSIERS:");
const directories = ["src", "dist", "logs", "uploads", "prisma/migrations"];
directories.forEach((dir) => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`   ${exists ? "✅" : "❌"} ${dir}`);
});

// Exécuter les tests asynchrones
testDatabase()
  .then(() => {
    console.log("\n✅ DIAGNOSTIC TERMINÉ");
  })
  .catch((error) => {
    console.error("\n❌ ERREUR LORS DU DIAGNOSTIC:", error);
  });
