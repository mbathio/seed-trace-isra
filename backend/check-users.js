// backend/check-users.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("=== VÉRIFICATION DES UTILISATEURS ===\n");

  try {
    // 1. Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`Nombre total d'utilisateurs: ${userCount}`);

    if (userCount === 0) {
      console.log("\n❌ AUCUN UTILISATEUR TROUVÉ!");
      console.log("Exécutez d'abord: npm run seed");
      return;
    }

    // 2. Lister tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        password: true, // Pour vérifier le hash
      },
    });

    console.log("\n📋 UTILISATEURS DANS LA BASE:");
    console.log("================================");

    for (const user of users) {
      console.log(`\nID: ${user.id}`);
      console.log(`Nom: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rôle: ${user.role}`);
      console.log(`Actif: ${user.isActive}`);
      console.log(`Créé le: ${user.createdAt}`);
      console.log(`Hash du mot de passe: ${user.password.substring(0, 20)}...`);
    }

    // 3. Tester la connexion avec un utilisateur
    console.log("\n\n🔐 TEST DE CONNEXION:");
    console.log("======================");

    const testEmail = "adiop@isra.sn";
    const testPassword = "123456";

    console.log(`\nTest avec: ${testEmail} / ${testPassword}`);

    const testUser = await prisma.user.findUnique({
      where: { email: testEmail, isActive: true },
    });

    if (!testUser) {
      console.log("❌ Utilisateur non trouvé ou inactif");
      return;
    }

    console.log("✅ Utilisateur trouvé");
    console.log(`Hash stocké: ${testUser.password}`);

    // Test du mot de passe
    const isPasswordValid = await bcrypt.compare(
      testPassword,
      testUser.password
    );
    console.log(
      `\nRésultat de la comparaison: ${
        isPasswordValid ? "✅ VALIDE" : "❌ INVALIDE"
      }`
    );

    if (!isPasswordValid) {
      // Test de hachage
      console.log("\n🔧 TEST DE HACHAGE:");
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log(`Nouveau hash généré: ${newHash}`);

      const testNewHash = await bcrypt.compare(testPassword, newHash);
      console.log(
        `Test du nouveau hash: ${testNewHash ? "✅ OK" : "❌ ERREUR"}`
      );

      console.log("\n💡 SOLUTION:");
      console.log("Le mot de passe stocké ne correspond pas.");
      console.log("Exécutez le script fix-passwords.js pour corriger.");
    }

    // 4. Vérifier les rôles
    console.log("\n\n📊 DISTRIBUTION DES RÔLES:");
    console.log("===========================");

    const roleCount = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        id: true,
      },
    });

    roleCount.forEach((item) => {
      console.log(`${item.role}: ${item._count.id} utilisateur(s)`);
    });
  } catch (error) {
    console.error("\n❌ ERREUR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log("\n✅ Déconnexion de la base de données");
  }
}

checkUsers().catch(console.error);
