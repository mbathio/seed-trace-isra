// diagnose.js - Script de diagnostic pour le backend
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Diagnostic du système ISRA Seed Trace...\n");

// Vérifier Node.js
console.log("📌 Node.js:");
try {
  const nodeVersion = process.version;
  console.log(`  ✅ Version: ${nodeVersion}`);
  if (parseInt(nodeVersion.split(".")[0].substring(1)) < 18) {
    console.log("  ⚠️  Version Node.js < 18, mise à jour recommandée");
  }
} catch (error) {
  console.log("  ❌ Erreur:", error.message);
}

// Vérifier les dossiers requis
console.log("\n📁 Dossiers requis:");
const requiredDirs = ["./logs", "./uploads", "./dist", "./prisma"];
requiredDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir} existe`);
  } else {
    console.log(`  ❌ ${dir} manquant`);
    if (dir !== "./dist") {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`     📁 Créé: ${dir}`);
      } catch (e) {
        console.log(`     ❌ Impossible de créer: ${e.message}`);
      }
    }
  }
});

// Vérifier le fichier .env
console.log("\n🔐 Configuration:");
if (fs.existsSync(".env")) {
  console.log("  ✅ .env existe");

  // Lire et vérifier les variables essentielles
  const envContent = fs.readFileSync(".env", "utf8");
  const requiredVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "PORT",
  ];

  requiredVars.forEach((varName) => {
    if (envContent.includes(`${varName}=`)) {
      console.log(`  ✅ ${varName} défini`);
    } else {
      console.log(`  ❌ ${varName} manquant`);
    }
  });
} else {
  console.log("  ❌ .env manquant");
  if (fs.existsSync(".env.example")) {
    try {
      fs.copyFileSync(".env.example", ".env");
      console.log("     📁 .env créé depuis .env.example");
    } catch (e) {
      console.log("     ❌ Impossible de créer .env:", e.message);
    }
  }
}

// Vérifier les dépendances
console.log("\n📦 Dépendances critiques:");
const criticalDeps = [
  "bcryptjs",
  "@prisma/client",
  "express",
  "jsonwebtoken",
  "cors",
  "dotenv",
];

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const installedDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

criticalDeps.forEach((dep) => {
  if (installedDeps[dep]) {
    console.log(`  ✅ ${dep} v${installedDeps[dep]}`);
  } else {
    console.log(`  ❌ ${dep} manquant`);
  }
});

// Vérifier bcrypt vs bcryptjs
if (installedDeps["bcrypt"]) {
  console.log("  ⚠️  bcrypt détecté - migration vers bcryptjs recommandée");
}

// Vérifier PostgreSQL
console.log("\n🐘 PostgreSQL:");
try {
  const dbUrl =
    process.env.DATABASE_URL ||
    "postgresql://user1:user1@localhost:5432/isra_seeds?schema=public";
  console.log(`  📍 URL: ${dbUrl.replace(/:[^:@]+@/, ":****@")}`);

  // Essayer de ping PostgreSQL
  try {
    execSync("pg_isready -h localhost -p 5432", { stdio: "ignore" });
    console.log("  ✅ PostgreSQL accessible");
  } catch (e) {
    console.log("  ❌ PostgreSQL non accessible");
    console.log("     💡 Vérifiez que PostgreSQL est démarré");
  }
} catch (error) {
  console.log("  ❌ Erreur:", error.message);
}

// Vérifier Prisma
console.log("\n🔷 Prisma:");
if (fs.existsSync("./node_modules/.prisma/client")) {
  console.log("  ✅ Client Prisma généré");
} else {
  console.log("  ❌ Client Prisma non généré");
  console.log("     💡 Exécutez: npx prisma generate");
}

// Vérifier les fichiers source problématiques
console.log("\n📄 Fichiers sources:");
const problematicFiles = [
  "./src/utils/encryption.ts",
  "./src/services/AuthService.ts",
  "./prisma/seed.ts",
];

problematicFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");
    if (
      content.includes('from "bcrypt"') ||
      content.includes("from 'bcrypt'")
    ) {
      console.log(`  ⚠️  ${file} - utilise bcrypt au lieu de bcryptjs`);
    } else if (content.includes('from "bcryptjs"')) {
      console.log(`  ✅ ${file} - utilise bcryptjs`);
    } else {
      console.log(`  📄 ${file} - pas d'import bcrypt détecté`);
    }
  } else {
    console.log(`  ❌ ${file} - fichier manquant`);
  }
});

// Vérifier le port
console.log("\n🌐 Port:");
const port = process.env.PORT || 3001;
console.log(`  📍 Port configuré: ${port}`);

// Vérifier si le port est libre
const net = require("net");
const server = net.createServer();

server.listen(port, "0.0.0.0", () => {
  console.log(`  ✅ Port ${port} disponible`);
  server.close();

  // Recommandations finales
  console.log("\n📋 Recommandations:");
  console.log("1. Exécutez: node migrate-bcrypt.js");
  console.log("2. Exécutez: npm install bcryptjs");
  console.log("3. Exécutez: npm uninstall bcrypt");
  console.log("4. Exécutez: npx prisma generate");
  console.log("5. Exécutez: npx prisma db push");
  console.log("6. Exécutez: npm run seed");
  console.log("7. Démarrez avec: npm run dev");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`  ❌ Port ${port} déjà utilisé`);
    console.log(
      "     💡 Changez le PORT dans .env ou arrêtez le processus utilisant ce port"
    );
  } else {
    console.log(`  ❌ Erreur: ${err.message}`);
  }

  // Recommandations finales même en cas d'erreur
  console.log("\n📋 Recommandations:");
  console.log("1. Corrigez les erreurs ci-dessus");
  console.log("2. Exécutez: node migrate-bcrypt.js");
  console.log("3. Exécutez: npm install bcryptjs && npm uninstall bcrypt");
  console.log("4. Exécutez: npx prisma generate");
  console.log("5. Exécutez: npx prisma db push");
  console.log("6. Exécutez: npm run seed");
  console.log("7. Démarrez avec: npm run dev");
});
