// backend/diagnose.js - Script de diagnostic
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔍 Diagnostic du système ISRA Seed Trace\n");

// 1. Vérifier Node.js
console.log("1️⃣ Node.js:");
try {
  console.log("   Version:", process.version);
  console.log("   ✅ Node.js installé\n");
} catch (error) {
  console.log("   ❌ Problème avec Node.js\n");
}

// 2. Vérifier les dépendances
console.log("2️⃣ Dépendances:");
try {
  const packageJson = require("./package.json");
  const nodeModulesExists = fs.existsSync("./node_modules");
  console.log("   node_modules existe:", nodeModulesExists ? "✅" : "❌");

  if (!nodeModulesExists) {
    console.log("   ⚠️  Installez les dépendances avec: npm install\n");
  } else {
    console.log("   ✅ Dépendances installées\n");
  }
} catch (error) {
  console.log("   ❌ Erreur:", error.message, "\n");
}

// 3. Vérifier le fichier .env
console.log("3️⃣ Configuration (.env):");
try {
  const envPath = path.join(__dirname, ".env");
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    console.log("   ✅ Fichier .env trouvé");

    // Lire et vérifier les variables importantes
    const envContent = fs.readFileSync(envPath, "utf8");
    const hasDatabase = envContent.includes("DATABASE_URL");
    const hasJWT = envContent.includes("JWT_SECRET");
    const hasPort = envContent.includes("PORT");

    console.log("   DATABASE_URL:", hasDatabase ? "✅" : "❌");
    console.log("   JWT_SECRET:", hasJWT ? "✅" : "❌");
    console.log("   PORT:", hasPort ? "✅" : "❌");

    // Extraire le port
    const portMatch = envContent.match(/PORT=(\d+)/);
    if (portMatch) {
      console.log("   Port configuré:", portMatch[1]);
    }
  } else {
    console.log("   ❌ Fichier .env manquant!");
    console.log("   Créez-le en copiant .env.example");
  }
  console.log("");
} catch (error) {
  console.log("   ❌ Erreur:", error.message, "\n");
}

// 4. Vérifier PostgreSQL
console.log("4️⃣ PostgreSQL:");
try {
  // Tester la commande psql
  execSync("psql --version", { stdio: "ignore" });
  console.log("   ✅ PostgreSQL installé");

  // Extraire DATABASE_URL du .env
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

    if (dbUrlMatch) {
      const dbUrl = dbUrlMatch[1];
      console.log("   URL:", dbUrl.replace(/:([^:@]+)@/, ":***@"));

      // Tester la connexion avec psql
      const urlParts = dbUrl.match(
        /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)\?/
      );
      if (urlParts) {
        const [, user, pass, host, port, database] = urlParts;
        try {
          // Utiliser pg_isready pour tester la connexion
          const result = execSync(
            `pg_isready -h ${host} -p ${port} -U ${user}`,
            {
              encoding: "utf8",
              stdio: "pipe",
            }
          );
          console.log("   ✅ PostgreSQL accessible");
        } catch (error) {
          console.log("   ❌ PostgreSQL non accessible");
          console.log("   Vérifiez que PostgreSQL est démarré");
        }
      }
    }
  }
} catch (error) {
  console.log("   ❌ PostgreSQL non installé ou non accessible");
  console.log("   Installez PostgreSQL et démarrez le service");
}
console.log("");

// 5. Vérifier Prisma
console.log("5️⃣ Prisma:");
try {
  const prismaSchemaExists = fs.existsSync("./prisma/schema.prisma");
  console.log("   schema.prisma:", prismaSchemaExists ? "✅" : "❌");

  // Vérifier si Prisma Client est généré
  const prismaClientExists = fs.existsSync("./node_modules/.prisma/client");
  console.log("   Prisma Client généré:", prismaClientExists ? "✅" : "❌");

  if (!prismaClientExists) {
    console.log("   ⚠️  Générez Prisma Client avec: npx prisma generate");
  }
} catch (error) {
  console.log("   ❌ Erreur:", error.message);
}
console.log("");

// 6. Test de port
console.log("6️⃣ Test des ports:");
const net = require("net");

function testPort(port, host = "localhost") {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve({ port, status: "occupé" });
      } else {
        resolve({ port, status: "erreur", error: err.message });
      }
    });

    server.once("listening", () => {
      server.close();
      resolve({ port, status: "libre" });
    });

    server.listen(port, host);
  });
}

// Tester les ports importants
Promise.all([
  testPort(3001), // Backend
  testPort(5173), // Frontend
  testPort(5432), // PostgreSQL
]).then((results) => {
  results.forEach((result) => {
    const icon = result.status === "libre" ? "✅" : "❌";
    console.log(`   Port ${result.port}: ${icon} ${result.status}`);
  });

  console.log("\n📋 Résumé des actions recommandées:");
  console.log("════════════════════════════════════");

  let actions = [];

  if (!fs.existsSync("./node_modules")) {
    actions.push("1. Installer les dépendances: npm install");
  }

  if (!fs.existsSync("./.env")) {
    actions.push("2. Créer le fichier .env (copiez .env.example)");
  }

  if (!fs.existsSync("./node_modules/.prisma/client")) {
    actions.push("3. Générer Prisma Client: npx prisma generate");
    actions.push("4. Appliquer le schéma: npx prisma db push");
  }

  const port3001Used =
    results.find((r) => r.port === 3001)?.status === "occupé";
  if (port3001Used) {
    actions.push(
      "5. Le port 3001 est occupé. Changez PORT dans .env ou arrêtez le processus"
    );
  }

  if (actions.length === 0) {
    console.log("✅ Tout semble être configuré correctement!");
    console.log("\nEssayez de lancer le serveur avec: npm run dev");
  } else {
    actions.forEach((action) => console.log(action));
  }

  console.log("\n💡 Pour plus de détails, consultez backend/logs/error.log");
});
