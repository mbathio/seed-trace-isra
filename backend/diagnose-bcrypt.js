// backend/diagnose-bcrypt.js
console.log("=== DIAGNOSTIC BCRYPT/BCRYPTJS ===\n");

// 1. Vérifier les modules installés
console.log("1. Vérification des modules installés:");
console.log("=====================================");

try {
  const bcryptjs = require("bcryptjs");
  console.log("✅ bcryptjs est installé");
  console.log("   Version:", require("bcryptjs/package.json").version);
} catch (e) {
  console.log("❌ bcryptjs n'est PAS installé");
}

try {
  const bcrypt = require("bcrypt");
  console.log("✅ bcrypt est installé");
  console.log("   Version:", require("bcrypt/package.json").version);
} catch (e) {
  console.log("❌ bcrypt n'est PAS installé");
}

// 2. Vérifier les imports dans les fichiers clés
console.log("\n2. Vérification des imports dans les fichiers:");
console.log("=============================================");

const fs = require("fs");
const path = require("path");

const filesToCheck = [
  "src/utils/encryption.ts",
  "src/services/AuthService.ts",
  "src/services/UserService.ts",
  "prisma/seed.ts",
];

filesToCheck.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");
    const bcryptImport = content.match(/from\s+["']bcrypt["']/);
    const bcryptjsImport = content.match(/from\s+["']bcryptjs["']/);

    console.log(`\n${file}:`);
    if (bcryptImport) {
      console.log("  ⚠️  Utilise 'bcrypt'");
    } else if (bcryptjsImport) {
      console.log("  ✅ Utilise 'bcryptjs'");
    } else {
      console.log("  ❓ Pas d'import bcrypt trouvé");
    }
  } else {
    console.log(`\n${file}: ❌ Fichier non trouvé`);
  }
});

// 3. Test de compatibilité des hashs
console.log("\n\n3. Test de compatibilité des hashs:");
console.log("====================================");

async function testBcryptCompatibility() {
  const testPassword = "123456";

  try {
    const bcryptjs = require("bcryptjs");

    // Générer un hash avec bcryptjs
    const hashBcryptjs = await bcryptjs.hash(testPassword, 12);
    console.log("\nHash bcryptjs:", hashBcryptjs);

    // Vérifier avec bcryptjs
    const validBcryptjs = await bcryptjs.compare(testPassword, hashBcryptjs);
    console.log(
      "Vérification bcryptjs:",
      validBcryptjs ? "✅ OK" : "❌ ERREUR"
    );

    // Si bcrypt est installé, tester la compatibilité croisée
    try {
      const bcrypt = require("bcrypt");

      // Hash avec bcrypt
      const hashBcrypt = await bcrypt.hash(testPassword, 12);
      console.log("\nHash bcrypt:", hashBcrypt);

      // Test croisé
      console.log("\nTests croisés:");
      const crossTest1 = await bcryptjs.compare(testPassword, hashBcrypt);
      console.log(
        "bcryptjs vérifie hash bcrypt:",
        crossTest1 ? "✅ OK" : "❌ ERREUR"
      );

      const crossTest2 = await bcrypt.compare(testPassword, hashBcryptjs);
      console.log(
        "bcrypt vérifie hash bcryptjs:",
        crossTest2 ? "✅ OK" : "❌ ERREUR"
      );
    } catch (e) {
      console.log("\n⚠️  bcrypt non disponible pour les tests croisés");
    }
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error.message);
  }
}

// 4. Vérifier la base de données
console.log("\n4. Vérification de la base de données:");
console.log("=====================================");

async function checkDatabase() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findFirst({
      where: { email: "adiop@isra.sn" },
    });

    if (user) {
      console.log("\nUtilisateur trouvé:", user.email);
      console.log("Hash stocké:", user.password.substring(0, 30) + "...");

      // Tester avec bcryptjs
      const bcryptjs = require("bcryptjs");
      const valid = await bcryptjs.compare("123456", user.password);
      console.log("Test avec bcryptjs:", valid ? "✅ VALIDE" : "❌ INVALIDE");

      // Analyser le format du hash
      if (
        user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$")
      ) {
        console.log("Format du hash: ✅ Format bcrypt standard");
      } else {
        console.log("Format du hash: ⚠️  Format non standard");
      }
    } else {
      console.log("❌ Utilisateur adiop@isra.sn non trouvé");
    }
  } catch (error) {
    console.error("❌ Erreur DB:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
(async () => {
  await testBcryptCompatibility();
  await checkDatabase();

  console.log("\n\n📋 RÉSUMÉ ET RECOMMANDATIONS:");
  console.log("==============================");
  console.log("Si les tests échouent, exécutez:");
  console.log("1. npm install bcryptjs");
  console.log("2. node fix-passwords.js");
  console.log("3. npm run dev");
})();
