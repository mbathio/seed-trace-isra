// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seeding de la base de données...");

  // Nettoyer la base de données
  await prisma.qualityControl.deleteMany();
  await prisma.productionActivity.deleteMany();
  await prisma.productionIssue.deleteMany();
  await prisma.weatherData.deleteMany();
  await prisma.production.deleteMany();
  await prisma.report.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.seedLot.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.productionHistory.deleteMany();
  await prisma.soilAnalysis.deleteMany();
  await prisma.previousCrop.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.multiplier.deleteMany();
  await prisma.variety.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Base de données nettoyée");

  // Créer les utilisateurs (MOCK_USERS du frontend)
  const hashedPassword = await bcrypt.hash("12345", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 1,
        name: "Amadou Diop",
        email: "adiop@isra.sn",
        password: hashedPassword,
        role: "RESEARCHER",
        avatar: "/avatars/amadou.png",
      },
    }),
    prisma.user.create({
      data: {
        id: 2,
        name: "Fatou Sy",
        email: "fsy@isra.sn",
        password: hashedPassword,
        role: "TECHNICIAN",
        avatar: "/avatars/fatou.png",
      },
    }),
    prisma.user.create({
      data: {
        id: 3,
        name: "Moussa Kane",
        email: "mkane@isra.sn",
        password: hashedPassword,
        role: "MANAGER",
        avatar: "/avatars/moussa.png",
      },
    }),
    prisma.user.create({
      data: {
        id: 4,
        name: "Ousmane Ndiaye",
        email: "ondiaye@isra.sn",
        password: hashedPassword,
        role: "INSPECTOR",
        avatar: "/avatars/ousmane.png",
      },
    }),
    prisma.user.create({
      data: {
        id: 5,
        name: "Admin ISRA",
        email: "admin@isra.sn",
        password: hashedPassword,
        role: "ADMIN",
        avatar: "/avatars/admin.png",
      },
    }),
  ]);

  console.log("👥 Utilisateurs créés:", users.length);

  // Créer les variétés (MOCK_VARIETIES du frontend)
  const varieties = await Promise.all([
    prisma.variety.create({
      data: {
        id: 1,
        code: "sahel108",
        name: "Sahel 108",
        cropType: "RICE",
        description:
          "Variété de cycle court (100-110 jours) adaptée aux zones irriguées du Nord",
        maturityDays: 105,
        yieldPotential: 9.5,
        resistances: ["Blast", "Virus de la panachure jaune"],
        origin: "AfricaRice",
        releaseYear: 1994,
      },
    }),
    prisma.variety.create({
      data: {
        id: 2,
        code: "sahel202",
        name: "Sahel 202",
        cropType: "RICE",
        description:
          "Variété améliorée à haut rendement, bien adaptée aux conditions sahéliennes",
        maturityDays: 125,
        yieldPotential: 10.0,
        resistances: ["Blast", "Pyriculariose"],
        origin: "ISRA/AfricaRice",
        releaseYear: 2007,
      },
    }),
    prisma.variety.create({
      data: {
        id: 3,
        code: "zm309",
        name: "ZM309",
        cropType: "MAIZE",
        description:
          "Variété de maïs tolérante à la sécheresse, adaptée aux zones semi-arides",
        maturityDays: 95,
        yieldPotential: 7.2,
        resistances: ["Streak", "Rouille"],
        origin: "IITA",
        releaseYear: 2012,
      },
    }),
    prisma.variety.create({
      data: {
        id: 4,
        code: "73-33",
        name: "73-33",
        cropType: "PEANUT",
        description:
          "Variété d'arachide traditionnelle du Sénégal, bien adaptée aux zones sahéliennes",
        maturityDays: 90,
        yieldPotential: 3.5,
        resistances: [],
        origin: "ISRA",
        releaseYear: 1973,
      },
    }),
  ]);

  console.log("🌾 Variétés créées:", varieties.length);

  // Créer les multiplicateurs
  const multipliers = await Promise.all([
    prisma.multiplier.create({
      data: {
        id: 1,
        name: "Ibrahima Ba",
        status: "ACTIVE",
        address: "Dagana, Saint-Louis",
        latitude: 16.5182,
        longitude: -15.5046,
        yearsExperience: 8,
        certificationLevel: "EXPERT",
        specialization: ["RICE", "MAIZE"],
        phone: "77 123 45 67",
        email: "ibrahima@example.com",
      },
    }),
    prisma.multiplier.create({
      data: {
        id: 2,
        name: "Aminata Diallo",
        status: "ACTIVE",
        address: "Podor, Saint-Louis",
        latitude: 16.6518,
        longitude: -14.9592,
        yearsExperience: 5,
        certificationLevel: "INTERMEDIATE",
        specialization: ["RICE", "PEANUT"],
        phone: "77 234 56 78",
        email: "aminata@example.com",
      },
    }),
    prisma.multiplier.create({
      data: {
        id: 3,
        name: "Mamadou Sow",
        status: "INACTIVE",
        address: "Richard-Toll, Saint-Louis",
        latitude: 16.4625,
        longitude: -15.7009,
        yearsExperience: 10,
        certificationLevel: "EXPERT",
        specialization: ["RICE", "SORGHUM", "MILLET"],
      },
    }),
    prisma.multiplier.create({
      data: {
        id: 4,
        name: "Aissatou Ndiaye",
        status: "ACTIVE",
        address: "Matam",
        latitude: 15.6552,
        longitude: -13.2578,
        yearsExperience: 3,
        certificationLevel: "BEGINNER",
        specialization: ["MAIZE", "COWPEA"],
        phone: "77 345 67 89",
      },
    }),
  ]);

  console.log("👨‍🌾 Multiplicateurs créés:", multipliers.length);

  // Créer les parcelles
  const parcels = await Promise.all([
    prisma.parcel.create({
      data: {
        id: 1,
        name: "Parcelle Dagana 01",
        area: 5.2,
        latitude: 16.5182,
        longitude: -15.5046,
        status: "IN_USE",
        soilType: "Argilo-limoneux",
        irrigationSystem: "Goutte-à-goutte",
        address: "Zone agricole de Dagana, Saint-Louis",
        multiplierId: 1,
      },
    }),
    prisma.parcel.create({
      data: {
        id: 2,
        name: "Parcelle Podor 02",
        area: 3.8,
        latitude: 16.6518,
        longitude: -14.9592,
        status: "AVAILABLE",
        soilType: "Limoneux",
        irrigationSystem: "Aspersion",
        address: "Zone agricole de Podor, Saint-Louis",
        multiplierId: 2,
      },
    }),
    prisma.parcel.create({
      data: {
        id: 3,
        name: "Parcelle Richard-Toll 03",
        area: 7.1,
        latitude: 16.4625,
        longitude: -15.7009,
        status: "RESTING",
        soilType: "Argileux",
        irrigationSystem: "Inondation contrôlée",
        address: "Zone agricole de Richard-Toll, Saint-Louis",
        multiplierId: 3,
      },
    }),
    prisma.parcel.create({
      data: {
        id: 4,
        name: "Parcelle Matam 04",
        area: 2.5,
        latitude: 15.6552,
        longitude: -13.2578,
        status: "AVAILABLE",
        soilType: "Sablo-limoneux",
        irrigationSystem: "Manuel",
        address: "Zone agricole de Matam",
        multiplierId: 4,
      },
    }),
  ]);

  console.log("🏞️ Parcelles créées:", parcels.length);

  // Créer les analyses de sol
  await Promise.all([
    prisma.soilAnalysis.create({
      data: {
        parcelId: 1,
        analysisDate: new Date("2024-01-15"),
        pH: 6.8,
        organicMatter: 2.1,
        nitrogen: 0.12,
        phosphorus: 45,
        potassium: 180,
        notes: "Sol fertile, bien adapté au riz",
      },
    }),
    prisma.soilAnalysis.create({
      data: {
        parcelId: 2,
        analysisDate: new Date("2024-02-01"),
        pH: 7.2,
        organicMatter: 1.8,
        nitrogen: 0.1,
        phosphorus: 38,
        potassium: 165,
        notes: "Bon potentiel, irrigation nécessaire",
      },
    }),
  ]);

  console.log("🧪 Analyses de sol créées");

  // Créer les lots de semences (MOCK_SEED_LOTS du frontend)
  const seedLots = await Promise.all([
    prisma.seedLot.create({
      data: {
        id: "SL-GO-2023-001",
        varietyId: 1, // Sahel 108
        level: "GO",
        quantity: 500,
        productionDate: new Date("2023-12-15"),
        expiryDate: new Date("2025-12-15"),
        multiplierId: 1,
        parcelId: 1,
        status: "CERTIFIED",
        batchNumber: "B-2023-001",
        notes: "Lot de base de haute qualité",
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // QR code fictif
      },
    }),
    prisma.seedLot.create({
      data: {
        id: "SL-G1-2024-001",
        varietyId: 1, // Sahel 108
        level: "G1",
        quantity: 2500,
        productionDate: new Date("2024-01-20"),
        expiryDate: new Date("2026-01-20"),
        multiplierId: 1,
        parcelId: 1,
        parentLotId: "SL-GO-2023-001",
        status: "CERTIFIED",
        batchNumber: "B-2024-001",
        notes: "Première génération, excellent rendement",
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      },
    }),
    prisma.seedLot.create({
      data: {
        id: "SL-G2-2024-002",
        varietyId: 2, // Sahel 202
        level: "G2",
        quantity: 1800,
        productionDate: new Date("2024-02-10"),
        expiryDate: new Date("2026-02-10"),
        multiplierId: 2,
        parcelId: 2,
        status: "IN_STOCK",
        batchNumber: "B-2024-002",
        notes: "Deuxième génération, qualité confirmée",
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      },
    }),
    prisma.seedLot.create({
      data: {
        id: "SL-R1-2024-003",
        varietyId: 3, // ZM309
        level: "R1",
        quantity: 5000,
        productionDate: new Date("2024-03-05"),
        expiryDate: new Date("2025-03-05"),
        multiplierId: 4,
        parcelId: 4,
        status: "PENDING",
        batchNumber: "B-2024-003",
        notes: "Lot commercial en cours de certification",
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      },
    }),
  ]);

  console.log("🌱 Lots de semences créés:", seedLots.length);

  // Créer les contrôles qualité
  await Promise.all([
    prisma.qualityControl.create({
      data: {
        lotId: "SL-R1-2024-003",
        controlDate: new Date("2024-03-10"),
        germinationRate: 82.1,
        varietyPurity: 96.8,
        moistureContent: 13.5,
        seedHealth: 95.2,
        result: "PASS",
        observations: "Qualité commerciale acceptable",
        testMethod: "Test rapide",
        inspectorId: 4,
      },
    }),
  ]);

  console.log("🔬 Contrôles qualité créés");

  // Créer les contrats
  await Promise.all([
    prisma.contract.create({
      data: {
        multiplierId: 1,
        varietyId: 1, // Sahel 108
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        seedLevel: "G1",
        expectedQuantity: 3000,
        actualQuantity: 2500,
        status: "ACTIVE",
        paymentTerms: "50% avance, 50% livraison",
        notes: "Contrat prioritaire pour variété Sahel 108",
      },
    }),
    prisma.contract.create({
      data: {
        multiplierId: 2,
        varietyId: 2, // Sahel 202
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-11-30"),
        seedLevel: "G2",
        expectedQuantity: 2000,
        actualQuantity: 1800,
        status: "COMPLETED",
        paymentTerms: "Paiement à 30 jours",
        notes: "Contrat terminé avec succès",
      },
    }),
  ]);

  console.log("📋 Contrats créés");

  // Créer les productions
  const productions = await Promise.all([
    prisma.production.create({
      data: {
        lotId: "SL-G1-2024-001",
        multiplierId: 1,
        parcelId: 1,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-05-20"),
        sowingDate: new Date("2024-01-20"),
        harvestDate: new Date("2024-05-15"),
        plannedQuantity: 3000,
        actualYield: 2500,
        status: "COMPLETED",
        notes: "Production réussie malgré quelques défis climatiques",
        weatherConditions: "Saison pluvieuse normale",
      },
    }),
    prisma.production.create({
      data: {
        lotId: "SL-G2-2024-002",
        multiplierId: 2,
        parcelId: 2,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-06-10"),
        sowingDate: new Date("2024-02-10"),
        harvestDate: new Date("2024-06-05"),
        plannedQuantity: 2000,
        actualYield: 1800,
        status: "COMPLETED",
        notes: "Rendement légèrement inférieur aux prévisions",
        weatherConditions: "Sécheresse précoce",
      },
    }),
    prisma.production.create({
      data: {
        lotId: "SL-R1-2024-003",
        multiplierId: 4,
        parcelId: 4,
        startDate: new Date("2024-03-01"),
        sowingDate: new Date("2024-03-05"),
        plannedQuantity: 5500,
        status: "IN_PROGRESS",
        notes: "Production en cours, bon développement",
        weatherConditions: "Conditions favorables",
      },
    }),
  ]);

  console.log("🚜 Productions créées:", productions.length);

  // Créer des activités de production
  await Promise.all([
    prisma.productionActivity.create({
      data: {
        productionId: 1,
        type: "SOIL_PREPARATION",
        activityDate: new Date("2024-01-16"),
        description: "Préparation du sol avec labour et hersage",
        personnel: ["Jean Sow", "Marie Diallo"],
        notes: "Sol bien préparé, conditions optimales",
        userId: 2,
        inputs: {
          create: [
            { name: "Diesel", quantity: "50", unit: "litres", cost: 45000 },
            {
              name: "Main d'œuvre",
              quantity: "16",
              unit: "heures",
              cost: 24000,
            },
          ],
        },
      },
    }),
    prisma.productionActivity.create({
      data: {
        productionId: 1,
        type: "SOWING",
        activityDate: new Date("2024-01-20"),
        description: "Semis des graines Sahel 108 G1",
        personnel: ["Jean Sow", "Amadou Ba"],
        notes: "Semis réalisé selon les bonnes pratiques",
        userId: 2,
        inputs: {
          create: [
            { name: "Semences G1", quantity: "25", unit: "kg", cost: 125000 },
            {
              name: "Fertilisant NPK",
              quantity: "100",
              unit: "kg",
              cost: 55000,
            },
          ],
        },
      },
    }),
  ]);

  console.log("📝 Activités de production créées");

  // Créer des problèmes de production
  await Promise.all([
    prisma.productionIssue.create({
      data: {
        productionId: 2,
        issueDate: new Date("2024-04-15"),
        type: "WEATHER",
        description: "Sécheresse prolongée affectant la croissance",
        severity: "MEDIUM",
        actions: "Irrigation supplémentaire mise en place",
        resolved: true,
        resolvedDate: new Date("2024-04-20"),
        cost: 75000,
      },
    }),
    prisma.productionIssue.create({
      data: {
        productionId: 3,
        issueDate: new Date("2024-04-10"),
        type: "PEST",
        description: "Attaque de chenilles sur jeunes plants",
        severity: "HIGH",
        actions: "Traitement insecticide bio appliqué",
        resolved: true,
        resolvedDate: new Date("2024-04-12"),
        cost: 35000,
      },
    }),
  ]);

  console.log("⚠️ Problèmes de production créés");

  // Créer des données météorologiques
  await Promise.all([
    prisma.weatherData.create({
      data: {
        productionId: 1,
        recordDate: new Date("2024-01-20"),
        temperature: 28.5,
        rainfall: 5.2,
        humidity: 65.8,
        windSpeed: 12.3,
        source: "Station météo Dagana",
      },
    }),
    prisma.weatherData.create({
      data: {
        productionId: 1,
        recordDate: new Date("2024-02-20"),
        temperature: 31.2,
        rainfall: 0.0,
        humidity: 58.1,
        windSpeed: 15.7,
        source: "Station météo Dagana",
      },
    }),
  ]);

  console.log("🌤️ Données météorologiques créées");

  // Créer des rapports
  await Promise.all([
    prisma.report.create({
      data: {
        title: "Rapport de production Q1 2024",
        type: "PRODUCTION",
        description:
          "Analyse des performances de production du premier trimestre",
        createdById: 3,
        parameters: {
          startDate: "2024-01-01",
          endDate: "2024-03-31",
          varieties: ["sahel108", "sahel202"],
        },
        isPublic: true,
      },
    }),
    prisma.report.create({
      data: {
        title: "Contrôle qualité - Bilan mensuel",
        type: "QUALITY",
        description: "Synthèse des contrôles qualité effectués en mars 2024",
        createdById: 4,
        parameters: {
          month: "2024-03",
          inspector: "Ousmane Ndiaye",
        },
        isPublic: false,
      },
    }),
  ]);

  console.log("📊 Rapports créés");

  console.log("✅ Seeding terminé avec succès !");
  console.log("\n🎯 Données créées :");
  console.log("   👥 5 utilisateurs");
  console.log("   🌾 4 variétés");
  console.log("   👨‍🌾 4 multiplicateurs");
  console.log("   🏞️ 4 parcelles");
  console.log("   🌱 4 lots de semences");
  console.log("   🔬 3 contrôles qualité");
  console.log("   📋 2 contrats");
  console.log("   🚜 3 productions");
  console.log("   📝 Activités et problèmes");
  console.log("   🌤️ Données météo");
  console.log("   📊 2 rapports");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
