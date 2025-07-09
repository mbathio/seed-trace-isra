// backend/diagnose.js - Script de diagnostic
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

console.log("🔍 DIAGNOSTIC ISRA SEED TRACE BACKEND\n");

async function diagnose() {
  const checks = [];

  // 1. Vérifier les fichiers requis
  console.log("📁 Vérification des fichiers...");
  const requiredFiles = [
    ".env",
    "package.json",
    "tsconfig.json",
    "src/server.ts",
    "src/app.ts",
    "prisma/schema.prisma",
  ];

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    checks.push({
      name: `Fichier ${file}`,
      status: exists ? "✅" : "❌",
      issue: exists ? null : `Fichier manquant: ${file}`,
    });
  }

  // 2. Vérifier les variables d'environnement
  console.log("\n🔐 Vérification des variables d'environnement...");
  require("dotenv").config();

  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "PORT",
  ];

  for (const envVar of requiredEnvVars) {
    const exists = !!process.env[envVar];
    checks.push({
      name: `Env ${envVar}`,
      status: exists ? "✅" : "❌",
      issue: exists ? null : `Variable manquante: ${envVar}`,
    });
  }

  // 3. Vérifier la connexion PostgreSQL
  console.log("\n🐘 Vérification de PostgreSQL...");
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    checks.push({
      name: "PostgreSQL Connection",
      status: "✅",
      issue: null,
    });
  } catch (error) {
    checks.push({
      name: "PostgreSQL Connection",
      status: "❌",
      issue: `Erreur de connexion: ${error.message}`,
    });
  }

  // 4. Vérifier les ports
  console.log("\n🔌 Vérification des ports...");
  const port = process.env.PORT || 3001;
  const net = require("net");

  await new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        checks.push({
          name: `Port ${port}`,
          status: "❌",
          issue: `Port ${port} déjà utilisé`,
        });
      }
      resolve();
    });

    tester.once("listening", () => {
      tester.close();
      checks.push({
        name: `Port ${port}`,
        status: "✅",
        issue: null,
      });
      resolve();
    });

    tester.listen(port);
  });

  // 5. Vérifier les dépendances
  console.log("\n📦 Vérification des dépendances...");
  const dependencies = [
    "@prisma/client",
    "express",
    "bcryptjs",
    "jsonwebtoken",
    "cors",
    "helmet",
  ];

  for (const dep of dependencies) {
    try {
      require.resolve(dep);
      checks.push({
        name: `Dépendance ${dep}`,
        status: "✅",
        issue: null,
      });
    } catch {
      checks.push({
        name: `Dépendance ${dep}`,
        status: "❌",
        issue: `Module non installé: ${dep}`,
      });
    }
  }

  // 6. Vérifier les erreurs de TypeScript
  console.log("\n📝 Vérification TypeScript...");
  try {
    const { stdout, stderr } = await execPromise("npx tsc --noEmit");
    if (stderr) {
      checks.push({
        name: "TypeScript",
        status: "⚠️",
        issue: "Warnings TypeScript",
      });
    } else {
      checks.push({
        name: "TypeScript",
        status: "✅",
        issue: null,
      });
    }
  } catch (error) {
    checks.push({
      name: "TypeScript",
      status: "❌",
      issue: "Erreurs de compilation TypeScript",
    });
  }

  // Résumé
  console.log("\n📊 RÉSUMÉ DU DIAGNOSTIC\n");
  console.log("Statut | Vérification");
  console.log("-------|-------------");

  const issues = [];
  for (const check of checks) {
    console.log(`${check.status}     | ${check.name}`);
    if (check.issue) {
      issues.push(check.issue);
    }
  }

  if (issues.length > 0) {
    console.log("\n❌ PROBLÈMES DÉTECTÉS:\n");
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });

    console.log("\n💡 SOLUTIONS RECOMMANDÉES:\n");

    if (issues.some((i) => i.includes("Module non installé"))) {
      console.log("• Exécuter: npm install");
    }

    if (issues.some((i) => i.includes("Variable manquante"))) {
      console.log(
        "• Créer/compléter le fichier .env avec les variables requises"
      );
      console.log("• Copier .env.example vers .env et remplir les valeurs");
    }

    if (issues.some((i) => i.includes("PostgreSQL"))) {
      console.log("• Vérifier que PostgreSQL est démarré");
      console.log("• Vérifier DATABASE_URL dans .env");
      console.log("• Créer la base de données: createdb isra_seeds");
      console.log("• Exécuter: npx prisma db push");
    }

    if (issues.some((i) => i.includes("Port"))) {
      console.log(`• Tuer le processus utilisant le port ${port}`);
      console.log("• Ou changer le PORT dans .env");
    }

    if (issues.some((i) => i.includes("TypeScript"))) {
      console.log("• Exécuter: npx tsc --noEmit pour voir les erreurs");
      console.log("• Corriger les erreurs TypeScript");
    }
  } else {
    console.log("\n✅ TOUT EST OK ! Le serveur devrait démarrer correctement.");
    console.log("\n🚀 Exécuter: npm run dev");
  }
}

// Exécuter le diagnostic
diagnose().catch(console.error);
