// backend/fix-passwords.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function fixPasswords() {
  console.log("=== CORRECTION DES MOTS DE PASSE ===\n");

  try {
    const defaultPassword = "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    console.log(`Mot de passe par défaut: ${defaultPassword}`);
    console.log(`Hash généré: ${hashedPassword.substring(0, 30)}...`);
    console.log("\n");

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`Mise à jour de ${users.length} utilisateurs...\n`);

    // Mettre à jour chaque utilisateur
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      console.log(`✅ ${user.name} (${user.email}) - Mot de passe mis à jour`);
    }

    console.log("\n✅ TOUS LES MOTS DE PASSE ONT ÉTÉ CORRIGÉS!");
    console.log("\n📝 Vous pouvez maintenant vous connecter avec:");
    console.log("   Email: n'importe quel email d'utilisateur");
    console.log("   Mot de passe: 123456");

    console.log("\n👥 Utilisateurs disponibles:");
    users.forEach((user) => {
      console.log(`   - ${user.email} (${user.name})`);
    });
  } catch (error) {
    console.error("\n❌ ERREUR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Demander confirmation
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  "⚠️  ATTENTION: Ce script va réinitialiser TOUS les mots de passe à '123456'"
);
readline.question("Continuer? (oui/non): ", (answer) => {
  if (
    answer.toLowerCase() === "oui" ||
    answer.toLowerCase() === "yes" ||
    answer.toLowerCase() === "o" ||
    answer.toLowerCase() === "y"
  ) {
    readline.close();
    fixPasswords().catch(console.error);
  } else {
    console.log("Opération annulée.");
    readline.close();
    process.exit(0);
  }
});
