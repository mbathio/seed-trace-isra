// backend/diagnose.js
// Script de diagnostic pour identifier les problèmes de démarrage

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Diagnostic du système ISRA Seed Trace\n");

// 1. Vérifier l'existence du fichier .env
const envPath = path.join(__dirname, ".env");
const envExists = fs.existsSync(envPath);

console.log(`1. Fichier .env: ${envExists ? "✅ Trouvé" : "❌ Manquant"}`);
if (!envExists) {
  console.log("   → Copiez .env.example vers .env et configurez-le");
}

// 2. Vérifier les variables d'environnement critiques
if (envExists) {
  require("dotenv").config();

  const criticalVars = [
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "DB_HOST",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_DATABASE",
  ];

  console.log("\n2. Variables d'environnement critiques:");
  criticalVars.forEach((varName) => {
    const exists = !!process.env[varName];
    const value = process.env[varName];
    if (exists) {
      // Masquer les valeurs sensibles
      const displayValue =
        varName.includes("PASSWORD") || varName.includes("SECRET")
          ? "***"
          : value?.substring(0, 20) + (value?.length > 20 ? "..." : "");
      console.log(`   ${varName}: ✅ ${displayValue}`);
    } else {
      console.log(`   ${varName}: ❌ Non défini`);
    }
  });
}

// 3. Vérifier PostgreSQL
console.log("\n3. Connexion PostgreSQL:");
try {
  const dbUrl =
    process.env.DATABASE_URL ||
    "postgresql://user1:user1@localhost:5432/isra_seeds";
  console.log(`   URL: ${dbUrl.replace(/:[^:@]+@/, ":***@")}`);

  // Extraire les infos de connexion
  const match = dbUrl.match(
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
  );
  if (match) {
    const [, user, , host, port, database] = match;
    console.log(`   Host: ${host}:${port}`);
    console.log(`   Database: ${database}`);
    console.log(`   User: ${user}`);
  }
} catch (error) {
  console.log("   ❌ Erreur lors du parsing de DATABASE_URL");
}

// 4. Vérifier les ports
console.log("\n4. Vérification des ports:");
const checkPort = (port) => {
  try {
    const net = require("net");
    const server = net.createServer();

    return new Promise((resolve) => {
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  } catch {
    return Promise.resolve(false);
  }
};

(async () => {
  const appPort = process.env.PORT || 3001;
  const isAppPortFree = await checkPort(appPort);
  console.log(
    `   Port ${appPort} (App): ${isAppPortFree ? "✅ Libre" : "❌ Occupé"}`
  );

  const dbPort = 5432;
  const isDbPortUsed = !(await checkPort(dbPort));
  console.log(
    `   Port ${dbPort} (PostgreSQL): ${
      isDbPortUsed ? "✅ En écoute" : "❌ Pas de service"
    }`
  );

  // 5. Vérifier les dépendances
  console.log("\n5. Dépendances npm:");
  try {
    const packageJson = require("./package.json");
    const requiredDeps = [
      "express",
      "typescript",
      "dotenv",
      "typeorm",
      "winston",
    ];

    requiredDeps.forEach((dep) => {
      const installed =
        packageJson.dependencies[dep] || packageJson.devDependencies[dep];
      console.log(`   ${dep}: ${installed ? "✅ Installé" : "❌ Manquant"}`);
    });
  } catch {
    console.log("   ❌ Impossible de lire package.json");
  }

  // 6. Vérifier TypeScript
  console.log("\n6. Configuration TypeScript:");
  const tsconfigExists = fs.existsSync(path.join(__dirname, "tsconfig.json"));
  console.log(
    `   tsconfig.json: ${tsconfigExists ? "✅ Trouvé" : "❌ Manquant"}`
  );

  // 7. Recommandations
  console.log("\n📋 Recommandations:");

  if (!envExists) {
    console.log("   1. Créez le fichier .env : cp .env.example .env");
  }

  if (!isAppPortFree && appPort) {
    console.log(`   2. Le port ${appPort} est occupé. Changez PORT dans .env`);
  }

  if (!isDbPortUsed) {
    console.log("   3. PostgreSQL ne semble pas démarré. Lancez-le avec:");
    console.log("      - Windows: Démarrer PostgreSQL depuis Services");
    console.log("      - Linux/Mac: sudo service postgresql start");
  }

  console.log("\n💡 Commandes utiles:");
  console.log("   npm install              # Installer les dépendances");
  console.log("   npx prisma db push       # Créer les tables");
  console.log("   npm run dev              # Démarrer le serveur");

  console.log("\n✅ Diagnostic terminé");
})();
