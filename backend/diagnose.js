// backend/diagnose.js - Script de diagnostic
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Charger les variables d'environnement
dotenv.config();

console.log("🔍 DIAGNOSTIC DU SERVEUR SEED-TRACE");
console.log("=====================================\n");

// 1. Vérifier les variables d'environnement critiques
console.log("1. VARIABLES D'ENVIRONNEMENT:");
console.log("----------------------------");
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "PORT",
  "NODE_ENV",
  "CLIENT_URL",
];

let envErrors = 0;
requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ${varName}: NON DÉFINI`);
    envErrors++;
  } else {
    // Masquer les valeurs sensibles
    let displayValue = value;
    if (varName === "DATABASE_URL" || varName === "JWT_SECRET") {
      displayValue =
        value.substring(0, 10) + "..." + (value.length > 10 ? " (masqué)" : "");
    }
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// 2. Vérifier la connexion à la base de données
console.log("\n2. CONNEXION BASE DE DONNÉES:");
console.log("-----------------------------");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Connexion à PostgreSQL réussie");

    // Tester une requête simple
    const userCount = await prisma.user.count();
    console.log(`✅ Nombre d'utilisateurs: ${userCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Erreur de connexion DB:", error.message);
    if (error.message.includes("P1001")) {
      console.error("   → PostgreSQL n'est pas accessible");
      console.error("   → Vérifiez que PostgreSQL est démarré");
      console.error("   → Vérifiez DATABASE_URL dans .env");
    }
  }
}

// 3. Vérifier les ports
console.log("\n3. VÉRIFICATION DU PORT:");
console.log("------------------------");
const net = require("net");
const PORT = process.env.PORT || 3001;

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${port} déjà utilisé`);
        resolve(false);
      } else {
        reject(err);
      }
    });

    server.once("listening", () => {
      console.log(`✅ Port ${port} disponible`);
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

// 4. Vérifier les fichiers critiques
console.log("\n4. FICHIERS CRITIQUES:");
console.log("----------------------");
const criticalFiles = [
  ".env",
  "src/server.ts",
  "src/app.ts",
  "prisma/schema.prisma",
  "package.json",
  "tsconfig.json",
];

criticalFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.error(`❌ ${file} MANQUANT`);
  }
});

// 5. Vérifier les dépendances
console.log("\n5. DÉPENDANCES NPM:");
console.log("-------------------");
try {
  const packageJson = require("./package.json");
  const deps = Object.keys(packageJson.dependencies || {});
  console.log(`✅ ${deps.length} dépendances trouvées`);

  // Vérifier si node_modules existe
  if (fs.existsSync(path.join(__dirname, "node_modules"))) {
    console.log("✅ node_modules présent");
  } else {
    console.error("❌ node_modules MANQUANT - Exécutez: npm install");
  }
} catch (error) {
  console.error("❌ Impossible de lire package.json");
}

// 6. Test de configuration TypeScript
console.log("\n6. CONFIGURATION TYPESCRIPT:");
console.log("----------------------------");
try {
  const tsConfig = require("./tsconfig.json");
  console.log(`✅ tsconfig.json chargé`);
  console.log(`   Target: ${tsConfig.compilerOptions.target}`);
  console.log(`   Module: ${tsConfig.compilerOptions.module}`);
} catch (error) {
  console.error("❌ Erreur tsconfig.json:", error.message);
}

// 7. Essayer de charger le serveur
console.log("\n7. TEST DE CHARGEMENT DU SERVEUR:");
console.log("----------------------------------");
async function testServerLoad() {
  try {
    // Tester l'import des modules principaux
    require("dotenv").config();
    console.log("✅ dotenv chargé");

    const expressApp = require("./dist/app");
    console.log("✅ App Express chargée");

    return true;
  } catch (error) {
    console.error("❌ Erreur de chargement:", error.message);

    // Si dist n'existe pas
    if (
      error.message.includes("Cannot find module") &&
      error.message.includes("dist")
    ) {
      console.error("   → Le dossier dist n'existe pas");
      console.error("   → Essayez: npm run build");
    }

    return false;
  }
}

// Exécuter tous les tests
async function runDiagnostics() {
  console.log("\n🚀 DÉMARRAGE DES DIAGNOSTICS...\n");

  // Test de la base de données
  await testDatabase();

  // Test du port
  await checkPort(PORT);

  // Test de chargement
  await testServerLoad();

  // Résumé
  console.log("\n📊 RÉSUMÉ DES DIAGNOSTICS:");
  console.log("==========================");

  if (envErrors > 0) {
    console.error(`❌ ${envErrors} variables d'environnement manquantes`);
    console.log("\n💡 SOLUTION:");
    console.log("   1. Copiez .env.example vers .env");
    console.log("   2. Remplissez les valeurs manquantes");
  }

  console.log("\n📝 COMMANDES RECOMMANDÉES:");
  console.log("-------------------------");
  console.log("1. npm install          # Installer les dépendances");
  console.log("2. npx prisma generate  # Générer le client Prisma");
  console.log("3. npx prisma db push   # Créer les tables");
  console.log("4. npm run dev          # Démarrer le serveur");

  console.log("\n✨ FIN DES DIAGNOSTICS\n");

  process.exit(0);
}

// Lancer les diagnostics
runDiagnostics().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
