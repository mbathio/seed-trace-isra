// backend/diagnose.js - Script de diagnostic
const fs = require("fs");
const path = require("path");
const net = require("net");
const { exec } = require("child_process");

console.log("🔍 Diagnostic du système ISRA Seed Trace\n");

// 1. Vérifier le fichier .env
function checkEnvFile() {
  console.log("📋 Vérification du fichier .env...");
  const envPath = path.join(__dirname, ".env");

  if (fs.existsSync(envPath)) {
    console.log("✅ Fichier .env trouvé");

    const envContent = fs.readFileSync(envPath, "utf8");
    const requiredVars = [
      "NODE_ENV",
      "PORT",
      "DATABASE_URL",
      "JWT_SECRET",
      "CLIENT_URL",
    ];

    const missingVars = [];
    requiredVars.forEach((varName) => {
      if (!envContent.includes(varName)) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      console.log("❌ Variables manquantes:", missingVars.join(", "));
      return false;
    } else {
      console.log("✅ Toutes les variables requises sont présentes");
      return true;
    }
  } else {
    console.log("❌ Fichier .env non trouvé!");
    console.log("💡 Créez un fichier .env à partir de .env.example");
    return false;
  }
}

// 2. Vérifier si le port est disponible
function checkPort(port) {
  return new Promise((resolve) => {
    console.log(`\n🔌 Test du port ${port}...`);

    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`❌ Le port ${port} est déjà utilisé`);

        // Trouver le processus qui utilise le port
        if (process.platform === "win32") {
          exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            if (!error && stdout) {
              console.log("💡 Processus utilisant le port:");
              console.log(stdout);
              console.log("\nPour tuer le processus: taskkill /F /PID [PID]");
            }
          });
        }
        resolve(false);
      } else {
        console.log("❌ Erreur lors du test du port:", err.message);
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      console.log(`✅ Port ${port} disponible`);
      resolve(true);
    });

    server.listen(port, "localhost");
  });
}

// 3. Vérifier PostgreSQL
function checkPostgres() {
  console.log("\n🐘 Test de connexion PostgreSQL...");

  // Essayer de se connecter avec pg
  exec("pg_isready -h localhost -p 5432", (error, stdout, stderr) => {
    if (error) {
      console.log("❌ PostgreSQL ne semble pas accessible");
      console.log("💡 Démarrez PostgreSQL:");
      console.log("   - Windows: Services > PostgreSQL > Démarrer");
      console.log(
        '   - Ou: pg_ctl start -D "C:\\Program Files\\PostgreSQL\\[version]\\data"'
      );
    } else {
      console.log("✅ PostgreSQL est accessible");
      console.log(stdout);
    }
  });
}

// 4. Vérifier les dépendances
function checkDependencies() {
  console.log("\n📦 Vérification des dépendances...");

  const packageJsonPath = path.join(__dirname, "package.json");
  const nodeModulesPath = path.join(__dirname, "node_modules");

  if (!fs.existsSync(packageJsonPath)) {
    console.log("❌ package.json non trouvé!");
    return false;
  }

  if (!fs.existsSync(nodeModulesPath)) {
    console.log("❌ node_modules non trouvé!");
    console.log("💡 Exécutez: npm install");
    return false;
  }

  // Vérifier quelques modules critiques
  const criticalModules = [
    "@prisma/client",
    "express",
    "dotenv",
    "socket.io",
    "winston",
  ];

  const missingModules = [];
  criticalModules.forEach((module) => {
    const modulePath = path.join(nodeModulesPath, module);
    if (!fs.existsSync(modulePath)) {
      missingModules.push(module);
    }
  });

  if (missingModules.length > 0) {
    console.log("❌ Modules manquants:", missingModules.join(", "));
    console.log("💡 Exécutez: npm install");
    return false;
  } else {
    console.log("✅ Tous les modules critiques sont installés");
    return true;
  }
}

// 5. Vérifier Prisma
function checkPrisma() {
  console.log("\n🔷 Vérification de Prisma...");

  const prismaPath = path.join(__dirname, "prisma", "schema.prisma");
  if (!fs.existsSync(prismaPath)) {
    console.log("❌ schema.prisma non trouvé!");
    return false;
  }

  console.log("✅ schema.prisma trouvé");

  // Vérifier si les migrations ont été appliquées
  exec("npx prisma migrate status", (error, stdout, stderr) => {
    if (error) {
      console.log("⚠️  Les migrations Prisma ne semblent pas appliquées");
      console.log("💡 Exécutez: npx prisma db push");
    } else {
      console.log("✅ État des migrations:");
      console.log(stdout);
    }
  });

  return true;
}

// 6. Test de démarrage rapide
async function quickStartTest() {
  console.log("\n🚀 Test de démarrage rapide...");

  try {
    // Charger dotenv
    require("dotenv").config();

    console.log("✅ Variables d'environnement chargées");
    console.log(`   PORT: ${process.env.PORT || "3001"}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || "isra_seeds"}`);

    // Test de connexion DB simple
    const { Client } = require("pg");
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.log("❌ DATABASE_URL non définie!");
      return;
    }

    const client = new Client({ connectionString });

    console.log("🔗 Tentative de connexion à la base de données...");
    await client.connect();
    console.log("✅ Connexion à la base de données réussie!");

    const result = await client.query("SELECT NOW()");
    console.log("✅ Requête test réussie:", result.rows[0].now);

    await client.end();
  } catch (error) {
    console.log("❌ Erreur lors du test:", error.message);
  }
}

// Exécuter tous les tests
async function runDiagnostics() {
  console.log("Démarrage du diagnostic...\n");

  const envOk = checkEnvFile();
  if (!envOk) {
    console.log("\n⚠️  Corrigez d'abord le fichier .env");
  }

  const port = process.env.PORT || 3001;
  await checkPort(port);

  checkPostgres();

  const depsOk = checkDependencies();
  if (!depsOk) {
    console.log("\n⚠️  Installez d'abord les dépendances");
  }

  checkPrisma();

  if (envOk && depsOk) {
    await quickStartTest();
  }

  console.log("\n📊 Résumé du diagnostic:");
  console.log("1. Si PostgreSQL n'est pas démarré, démarrez-le");
  console.log("2. Si le port est occupé, changez PORT dans .env");
  console.log("3. Si des dépendances manquent: npm install");
  console.log("4. Si Prisma n'est pas synchronisé: npx prisma db push");
  console.log("5. Redémarrez avec: npm run dev");
}

// Lancer le diagnostic
runDiagnostics();
