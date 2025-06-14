// backend/check-db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("🔍 Vérification de la base de données...\n");

  try {
    // Vérifier la connexion
    await prisma.$connect();
    console.log("✅ Connexion à la base de données réussie\n");

    // Compter les enregistrements dans chaque table
    const counts = {
      users: await prisma.user.count(),
      varieties: await prisma.variety.count(),
      seedLots: await prisma.seedLot.count(),
      multipliers: await prisma.multiplier.count(),
      parcels: await prisma.parcel.count(),
      productions: await prisma.production.count(),
      qualityControls: await prisma.qualityControl.count(),
      reports: await prisma.report.count(),
    };

    console.log("📊 Nombre d'enregistrements par table :");
    console.log("================================");
    Object.entries(counts).forEach(([table, count]) => {
      const status = count > 0 ? "✅" : "❌";
      console.log(`${status} ${table}: ${count}`);
    });

    // Vérifier les données spécifiques
    console.log("\n📋 Vérifications détaillées :");
    console.log("================================");

    // Vérifier les lots actifs
    const activeLots = await prisma.seedLot.count({
      where: { isActive: true, status: "CERTIFIED" },
    });
    console.log(`✓ Lots certifiés actifs: ${activeLots}`);

    // Vérifier les productions en cours
    const inProgressProductions = await prisma.production.count({
      where: { status: "IN_PROGRESS" },
    });
    console.log(`✓ Productions en cours: ${inProgressProductions}`);

    // Vérifier les contrôles qualité réussis
    const passedQC = await prisma.qualityControl.count({
      where: { result: "PASS" },
    });
    console.log(`✓ Contrôles qualité réussis: ${passedQC}`);

    // Vérifier les variétés actives
    const activeVarieties = await prisma.variety.count({
      where: { isActive: true },
    });
    console.log(`✓ Variétés actives: ${activeVarieties}`);

    // Afficher quelques utilisateurs
    console.log("\n👥 Utilisateurs dans la base :");
    console.log("================================");
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true },
      take: 5,
    });
    users.forEach((user) => {
      console.log(`- ${user.email} (${user.name}) - Rôle: ${user.role}`);
    });

    // Vérifier s'il y a des erreurs récentes
    console.log("\n⚠️  Vérification des problèmes potentiels :");
    console.log("================================");

    // Lots sans variété
    const lotsWithoutVariety = await prisma.seedLot.count({
      where: { varietyId: null },
    });
    if (lotsWithoutVariety > 0) {
      console.log(`❌ ${lotsWithoutVariety} lots sans variété`);
    }

    // Productions sans lot
    const productionsWithoutLot = await prisma.production.count({
      where: { lotId: null },
    });
    if (productionsWithoutLot > 0) {
      console.log(`❌ ${productionsWithoutLot} productions sans lot`);
    }

    console.log("\n✅ Vérification terminée !");
  } catch (error) {
    console.error("❌ Erreur lors de la vérification :", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la vérification
checkDatabase();
