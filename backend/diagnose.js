// backend/diagnose.js
console.log("=== DIAGNOSTIC DU SERVEUR ===\n");

const fs = require("fs");
const path = require("path");

// 1. Vérifier les variables d'environnement
console.log("1. Vérification des variables d'environnement:");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log("   ✓ .env trouvé");
  const envContent = fs.readFileSync(envPath, "utf8");
  const hasDbUrl = envContent.includes("DATABASE_URL");
  const hasJwtSecret = envContent.includes("JWT_SECRET");
  const hasPort = envContent.includes("PORT");

  console.log(`   ${hasDbUrl ? "✓" : "✗"} DATABASE_URL défini`);
  console.log(`   ${hasJwtSecret ? "✓" : "✗"} JWT_SECRET défini`);
  console.log(`   ${hasPort ? "✓" : "✗"} PORT défini`);
} else {
  console.log("   ✗ .env NON TROUVÉ!");
}

// 2. Vérifier la connexion à la base de données
console.log("\n2. Test de connexion à la base de données:");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("   Tentative de connexion...");
    await prisma.$connect();
    console.log("   ✓ Connexion réussie");

    // Tester une requête simple
    const userCount = await prisma.user.count();
    console.log(`   ✓ Base de données accessible (${userCount} utilisateurs)`);

    await prisma.$disconnect();
    console.log("   ✓ Déconnexion réussie");
  } catch (error) {
    console.log("   ✗ ERREUR de connexion:", error.message);
    console.log("\n   Solutions possibles:");
    console.log("   - Vérifiez que PostgreSQL est démarré");
    console.log("   - Vérifiez DATABASE_URL dans .env");
    console.log("   - Exécutez: npx prisma generate");
    console.log("   - Exécutez: npx prisma db push");
  }
}

// 3. Vérifier les ports
console.log("\n3. Vérification des ports:");
const net = require("net");

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, "localhost", () => {
      server.close(() => {
        console.log(`   ✓ Port ${port} disponible`);
        resolve(true);
      });
    });
    server.on("error", (err) => {
      console.log(`   ✗ Port ${port} déjà utilisé`);
      resolve(false);
    });
  });
}

// 4. Vérifier les dépendances critiques
console.log("\n4. Vérification des dépendances:");
const requiredPackages = [
  "express",
  "@prisma/client",
  "bcryptjs",
  "jsonwebtoken",
  "cors",
  "helmet",
  "dotenv",
  "winston",
  "zod",
];

requiredPackages.forEach((pkg) => {
  try {
    require.resolve(pkg);
    console.log(`   ✓ ${pkg} installé`);
  } catch (error) {
    console.log(`   ✗ ${pkg} MANQUANT - exécutez: npm install`);
  }
});

// 5. Test d'import des modules principaux
console.log("\n5. Test d'import des modules:");
try {
  require("./dist/server.js");
  console.log("   ✓ Build TypeScript trouvé");
} catch (error) {
  console.log("   ✗ Build TypeScript non trouvé - exécutez: npm run build");
}

// Exécuter les tests asynchrones
async function runDiagnostic() {
  await testDatabase();
  await checkPort(3001);

  console.log("\n=== DIAGNOSTIC TERMINÉ ===");
  console.log("\nSi tout est vert (✓), essayez:");
  console.log("1. npm run dev");
  console.log("2. Si ça ne marche pas, essayez le serveur de test:");
  console.log("   node src/test-server.js");

  process.exit(0);
}

runDiagnostic().catch(console.error);
