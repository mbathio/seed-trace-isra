// prisma/seed.ts - Données réelles ISRA
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌱 Début du seeding de la base de données avec données réelles ISRA..."
  );

  // Nettoyer la base de données dans le bon ordre (dépendances)
  await prisma.activityInput.deleteMany();
  await prisma.productionActivity.deleteMany();
  await prisma.productionIssue.deleteMany();
  await prisma.weatherData.deleteMany();
  await prisma.qualityControl.deleteMany();
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

  // Créer les utilisateurs
  const hashedPassword = await bcrypt.hash("123456", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Amadou Diop",
        email: "adiop@isra.sn",
        password: hashedPassword,
        role: "RESEARCHER",
        avatar: "/avatars/amadou.png",
      },
    }),
    prisma.user.create({
      data: {
        name: "Fatou Sy",
        email: "fsy@isra.sn",
        password: hashedPassword,
        role: "TECHNICIAN",
        avatar: "/avatars/fatou.png",
      },
    }),
    prisma.user.create({
      data: {
        name: "Moussa Kane",
        email: "mkane@isra.sn",
        password: hashedPassword,
        role: "MANAGER",
        avatar: "/avatars/moussa.png",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ousmane Ndiaye",
        email: "ondiaye@isra.sn",
        password: hashedPassword,
        role: "INSPECTOR",
        avatar: "/avatars/ousmane.png",
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin ISRA",
        email: "admin@isra.sn",
        password: hashedPassword,
        role: "ADMIN",
        avatar: "/avatars/admin.png",
      },
    }),
  ]);

  console.log("👥 Utilisateurs créés:", users.length);

  // Créer les variétés de RIZ basées sur les données réelles
  const riceVarieties = await Promise.all([
    // Variétés principales ISRIZ
    prisma.variety.create({
      data: {
        code: "ISRIZ-15",
        name: "ISRIZ 15",
        cropType: "RICE",
        description:
          "Variété principale de riz, cultivée sur 6 bandes en février-juin 2025",
        maturityDays: 120,
        yieldPotential: 8.5,
        resistances: ["Blast", "Pyriculariose"],
        origin: "ISRA",
        releaseYear: 2020,
      },
    }),
    prisma.variety.create({
      data: {
        code: "ISRIZ-13",
        name: "ISRIZ 13",
        cropType: "RICE",
        description:
          "Variété de riz avec performance correcte, cultivée sur 0.5 hectare",
        maturityDays: 115,
        yieldPotential: 7.8,
        resistances: ["Blast"],
        origin: "ISRA",
        releaseYear: 2019,
      },
    }),
    prisma.variety.create({
      data: {
        code: "ISRIZ-17",
        name: "ISRIZ 17",
        cropType: "RICE",
        description: "Variété de riz adaptée aux conditions locales",
        maturityDays: 110,
        yieldPotential: 8.0,
        resistances: ["Virus de la panachure jaune"],
        origin: "ISRA",
        releaseYear: 2021,
      },
    }),
    prisma.variety.create({
      data: {
        code: "ISRIZ-12",
        name: "ISRIZ 12",
        cropType: "RICE",
        description: "Variété homogène cultivée sur 2 bandes",
        maturityDays: 118,
        yieldPotential: 7.5,
        resistances: ["Pyriculariose"],
        origin: "ISRA",
        releaseYear: 2018,
      },
    }),
    prisma.variety.create({
      data: {
        code: "ISRIZ-16",
        name: "ISRIZ 16",
        cropType: "RICE",
        description: "Variété irrigée avec bon rendement",
        maturityDays: 112,
        yieldPotential: 8.2,
        resistances: ["Blast", "Virus de la panachure jaune"],
        origin: "ISRA",
        releaseYear: 2020,
      },
    }),
    prisma.variety.create({
      data: {
        code: "ISRIZ-11",
        name: "ISRIZ 11",
        cropType: "RICE",
        description: "Variété de riz avec bon taux de germination (78%)",
        maturityDays: 115,
        yieldPotential: 7.6,
        resistances: ["Blast"],
        origin: "ISRA",
        releaseYear: 2017,
      },
    }),
    prisma.variety.create({
      data: {
        code: "ISRIZ-10",
        name: "ISRIZ 10",
        cropType: "RICE",
        description: "Variété avec excellent taux de germination (89%)",
        maturityDays: 110,
        yieldPotential: 8.3,
        resistances: ["Pyriculariose", "Virus de la panachure jaune"],
        origin: "ISRA",
        releaseYear: 2016,
      },
    }),
    // Variétés Sahel
    prisma.variety.create({
      data: {
        code: "SAHEL-117",
        name: "Sahel 117",
        cropType: "RICE",
        description: "Variété de riz Sahel adaptée aux conditions semi-arides",
        maturityDays: 105,
        yieldPotential: 9.0,
        resistances: ["Sécheresse", "Blast"],
        origin: "AfricaRice/ISRA",
        releaseYear: 2015,
      },
    }),
    prisma.variety.create({
      data: {
        code: "SAHEL-108",
        name: "Sahel 108",
        cropType: "RICE",
        description:
          "Variété de cycle court adaptée aux zones irriguées du Nord",
        maturityDays: 105,
        yieldPotential: 9.5,
        resistances: ["Blast", "Virus de la panachure jaune"],
        origin: "AfricaRice",
        releaseYear: 1994,
      },
    }),
    prisma.variety.create({
      data: {
        code: "SAHEL-209",
        name: "Sahel 209",
        cropType: "RICE",
        description: "Variété améliorée pour les conditions sahéliennes",
        maturityDays: 120,
        yieldPotential: 8.8,
        resistances: ["Sécheresse", "Pyriculariose"],
        origin: "ISRA/AfricaRice",
        releaseYear: 2009,
      },
    }),
    prisma.variety.create({
      data: {
        code: "IR-1529",
        name: "IR 1529",
        cropType: "RICE",
        description: "Variété internationale adaptée localement",
        maturityDays: 125,
        yieldPotential: 8.0,
        resistances: ["Blast"],
        origin: "IRRI",
        releaseYear: 2000,
      },
    }),
  ]);

  // Créer les variétés de BLÉ basées sur les données réelles de la station ISRA Fanaye
  // Note: Utilisation temporaire de SORGHUM car WHEAT n'est pas dans l'enum
  // Recommandation: Ajouter WHEAT à l'enum CropType dans schema.prisma
  const wheatVarieties = await Promise.all([
    prisma.variety.create({
      data: {
        code: "ALIOUNE",
        name: "Alioune",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé tendre G3, homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 95,
        yieldPotential: 6.5,
        resistances: ["Rouille", "Septoriose"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
    prisma.variety.create({
      data: {
        code: "HAMAT",
        name: "Hamat",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé tendre homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 90,
        yieldPotential: 6.8,
        resistances: ["Rouille"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
    prisma.variety.create({
      data: {
        code: "PENDAO",
        name: "Pendao",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé tendre homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 92,
        yieldPotential: 6.3,
        resistances: ["Rouille", "Oïdium"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
    prisma.variety.create({
      data: {
        code: "DIRE-15",
        name: "Diré 15",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé tendre homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 88,
        yieldPotential: 5.8,
        resistances: ["Septoriose"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
    prisma.variety.create({
      data: {
        code: "DIOUFISSA",
        name: "Dioufissa",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé dur homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 100,
        yieldPotential: 6.2,
        resistances: ["Septoriose", "Rouille"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
    prisma.variety.create({
      data: {
        code: "HABY",
        name: "Haby",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé dur homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 95,
        yieldPotential: 6.4,
        resistances: ["Rouille", "Oïdium"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
    prisma.variety.create({
      data: {
        code: "AMINA",
        name: "Amina",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé dur homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 93,
        yieldPotential: 5.9,
        resistances: ["Oïdium"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
    prisma.variety.create({
      data: {
        code: "FANAYE",
        name: "Fanaye",
        cropType: "WHEAT", // TODO: Remplacer par WHEAT après ajout dans l'enum
        description:
          "Variété de blé dur homologuée SF 2024 - Station ISRA Fanaye",
        maturityDays: 91,
        yieldPotential: 5.7,
        resistances: ["Rouille"],
        origin: "ISRA Fanaye",
        releaseYear: 2024,
      },
    }),
  ]);

  const varieties = [...riceVarieties, ...wheatVarieties];
  console.log(
    "🌾 Variétés créées:",
    varieties.length,
    "(Riz et Blé de la Station ISRA Fanaye)"
  );

  // Créer le multiplicateur principal - Station ISRA Fanaye
  const multipliers = await Promise.all([
    prisma.multiplier.create({
      data: {
        name: "Station ISRA Fanaye",
        status: "ACTIVE",
        address: "Fanaye, Saint-Louis, Sénégal",
        latitude: 16.5667,
        longitude: -15.1333,
        yearsExperience: 25,
        certificationLevel: "EXPERT",
        specialization: ["RICE", "SORGHUM"], // SORGHUM temporaire pour le blé
        phone: "77 100 00 00",
        email: "station.fanaye@isra.sn",
      },
    }),
  ]);

  console.log("👨‍🌾 Station de multiplication créée: Station ISRA Fanaye");

  // Créer les parcelles basées sur les données d'irrigation
  const parcels = await Promise.all([
    // Parcelles pour ISRIZ-15 (6 bandes)
    prisma.parcel.create({
      data: {
        name: "Bande 1 - Prebase ISRIZ-15",
        area: 0.5,
        latitude: 16.5667,
        longitude: -15.1333,
        status: "IN_USE",
        soilType: "Argilo-limoneux",
        irrigationSystem: "Irrigation contrôlée",
        address: "Station ISRA Fanaye",
        multiplierId: multipliers[0].id,
      },
    }),
    prisma.parcel.create({
      data: {
        name: "Bande 2 - Prebase ISRIZ-15",
        area: 0.5,
        latitude: 16.5668,
        longitude: -15.1334,
        status: "IN_USE",
        soilType: "Argilo-limoneux",
        irrigationSystem: "Irrigation contrôlée",
        address: "Station ISRA Fanaye",
        multiplierId: multipliers[0].id,
      },
    }),
    prisma.parcel.create({
      data: {
        name: "Bande 3 - Crystal ISRIZ-15",
        area: 0.5,
        latitude: 16.5669,
        longitude: -15.1335,
        status: "IN_USE",
        soilType: "Argilo-limoneux",
        irrigationSystem: "Irrigation contrôlée",
        address: "Station ISRA Fanaye",
        multiplierId: multipliers[0].id,
      },
    }),
    prisma.parcel.create({
      data: {
        name: "Bande 4 - ISRIZ-13",
        area: 0.5,
        latitude: 16.567,
        longitude: -15.1336,
        status: "IN_USE",
        soilType: "Hollaldé-argileux",
        irrigationSystem: "Irrigation manuelle",
        address: "Station ISRA Fanaye",
        multiplierId: multipliers[0].id,
      },
    }),
    prisma.parcel.create({
      data: {
        name: "Bande 5 - ISRIZ-07 G3",
        area: 0.5,
        latitude: 16.5671,
        longitude: -15.1337,
        status: "IN_USE",
        soilType: "Hollaldé-argileux",
        irrigationSystem: "Irrigation manuelle",
        address: "Station ISRA Fanaye",
        multiplierId: multipliers[0].id,
      },
    }),
    prisma.parcel.create({
      data: {
        name: "Bande 7 - ISRIZ-12",
        area: 0.3,
        latitude: 16.5672,
        longitude: -15.1338,
        status: "IN_USE",
        soilType: "Argilo-limoneux",
        irrigationSystem: "Irrigation contrôlée",
        address: "Station ISRA Fanaye",
        multiplierId: multipliers[0].id,
      },
    }),
  ]);

  console.log("🏞️ Parcelles créées:", parcels.length);

  // Créer les lots de semences basés sur les données réelles
  const seedLots = await Promise.all([
    // Lots de riz niveau G0
    prisma.seedLot.create({
      data: {
        id: "SL-G0-2024-ALIOUNE",
        varietyId: riceVarieties.find((v) => v.code === "SAHEL-108")!.id,
        level: "GO",
        quantity: 88, // 88 kg selon les données
        productionDate: new Date("2024-01-15"),
        expiryDate: new Date("2026-01-15"),
        multiplierId: multipliers[0].id,
        parcelId: parcels[0].id,
        status: "CERTIFIED",
        batchNumber: "ALIOUNE-2024",
        notes: "Niveau G0 - 2500 épis",
      },
    }),
    prisma.seedLot.create({
      data: {
        id: "SL-G0-2024-HAMATH",
        varietyId: riceVarieties.find((v) => v.code === "SAHEL-108")!.id,
        level: "GO",
        quantity: 75,
        productionDate: new Date("2024-01-15"),
        expiryDate: new Date("2026-01-15"),
        multiplierId: multipliers[0].id,
        parcelId: parcels[1].id,
        status: "CERTIFIED",
        batchNumber: "HAMATH-2024",
        notes: "Niveau G0 - 2500 épis",
      },
    }),
    // Lots de riz niveau G3 - Hivernage 2024
    prisma.seedLot.create({
      data: {
        id: "SL-G3-2024-SAHEL117",
        varietyId: riceVarieties.find((v) => v.code === "SAHEL-117")!.id,
        level: "G3",
        quantity: 680, // 17x40 kg
        productionDate: new Date("2024-09-15"),
        expiryDate: new Date("2026-09-15"),
        multiplierId: multipliers[0].id,
        parcelId: parcels[0].id,
        status: "CERTIFIED",
        batchNumber: "SAHEL117-H2024",
        notes: "Hivernage 2024 - 17 sacs de 40kg",
      },
    }),
    prisma.seedLot.create({
      data: {
        id: "SL-G3-2024-ISRIZ17",
        varietyId: riceVarieties.find((v) => v.code === "ISRIZ-17")!.id,
        level: "G3",
        quantity: 360, // 9x40 kg
        productionDate: new Date("2024-09-15"),
        expiryDate: new Date("2026-09-15"),
        multiplierId: multipliers[0].id,
        parcelId: parcels[2].id,
        status: "CERTIFIED",
        batchNumber: "ISRIZ17-H2024",
        notes: "Hivernage 2024 - 9 sacs de 40kg, superficie 2500m²",
      },
    }),
    prisma.seedLot.create({
      data: {
        id: "SL-G3-2024-ISRIZ15",
        varietyId: riceVarieties.find((v) => v.code === "ISRIZ-15")!.id,
        level: "G3",
        quantity: 397, // (9x40) + (1x37) kg
        productionDate: new Date("2024-09-15"),
        expiryDate: new Date("2026-09-15"),
        multiplierId: multipliers[0].id,
        parcelId: parcels[0].id,
        status: "CERTIFIED",
        batchNumber: "ISRIZ15-H2024",
        notes: "Hivernage 2024 - 9 sacs de 40kg + 1 sac de 37kg",
      },
    }),
    // Lots de blé G3
    prisma.seedLot.create({
      data: {
        id: "SL-G3-2024-ALIOUNE-BLE",
        varietyId: wheatVarieties.find((v) => v.code === "ALIOUNE")!.id,
        level: "G3",
        quantity: 919,
        productionDate: new Date("2024-11-15"),
        expiryDate: new Date("2026-11-15"),
        multiplierId: multipliers[0].id,
        parcelId: parcels[3].id,
        status: "CERTIFIED",
        batchNumber: "ALIOUNE-BLE-2024",
        notes: "Blé tendre G3 - Superficie 0.5 ha",
      },
    }),
    prisma.seedLot.create({
      data: {
        id: "SL-G3-2024-DIOUFISSA-BLE",
        varietyId: wheatVarieties.find((v) => v.code === "DIOUFISSA")!.id,
        level: "G3",
        quantity: 638,
        productionDate: new Date("2024-11-15"),
        expiryDate: new Date("2026-11-15"),
        multiplierId: multipliers[0].id,
        parcelId: parcels[4].id,
        status: "CERTIFIED",
        batchNumber: "DIOUFISSA-BLE-2024",
        notes: "Blé dur G3 - Superficie 0.5 ha",
      },
    }),
  ]);

  console.log("🌱 Lots de semences créés:", seedLots.length);

  // Créer les contrôles qualité basés sur les taux de germination
  const qualityControls = await Promise.all([
    prisma.qualityControl.create({
      data: {
        lotId: "SL-G3-2024-ISRIZ17",
        controlDate: new Date("2024-10-01"),
        germinationRate: 81, // ISRIZ 17 - 81% selon les données
        varietyPurity: 98.5,
        moistureContent: 12.5,
        seedHealth: 96.0,
        result: "PASS",
        observations: "Taux de germination conforme aux normes",
        testMethod: "Test standard ISTA",
        inspectorId: users.find((u) => u.role === "INSPECTOR")!.id,
      },
    }),
    prisma.qualityControl.create({
      data: {
        lotId: "SL-G3-2024-ISRIZ15",
        controlDate: new Date("2024-10-01"),
        germinationRate: 78, // ISRIZ 15 - 78% selon les données
        varietyPurity: 97.8,
        moistureContent: 13.0,
        seedHealth: 95.5,
        result: "PASS",
        observations: "Qualité acceptable pour distribution",
        testMethod: "Test standard ISTA",
        inspectorId: users.find((u) => u.role === "INSPECTOR")!.id,
      },
    }),
    prisma.qualityControl.create({
      data: {
        lotId: "SL-G3-2024-SAHEL117",
        controlDate: new Date("2024-10-05"),
        germinationRate: 89, // ISRIZ 10 - 89% selon les données
        varietyPurity: 99.0,
        moistureContent: 12.0,
        seedHealth: 97.5,
        result: "PASS",
        observations: "Excellente qualité, taux de germination élevé",
        testMethod: "Test standard ISTA",
        inspectorId: users.find((u) => u.role === "INSPECTOR")!.id,
      },
    }),
  ]);

  console.log("🔬 Contrôles qualité créés:", qualityControls.length);

  // Créer les productions basées sur les données réelles
  const productions = await Promise.all([
    // Production ISRIZ-15 (Bande 1)
    prisma.production.create({
      data: {
        lotId: "SL-G3-2024-ISRIZ15",
        multiplierId: multipliers[0].id,
        parcelId: parcels[0].id,
        startDate: new Date("2025-02-09"),
        sowingDate: new Date("2025-03-17"),
        harvestDate: new Date("2025-06-15"),
        plannedQuantity: 450,
        actualYield: 397,
        status: "IN_PROGRESS",
        notes: "Production en cours - Variété principale",
        weatherConditions: "Conditions favorables",
      },
    }),
    // Production ISRIZ-13 (Bande 4)
    prisma.production.create({
      data: {
        lotId: "SL-G3-2024-SAHEL117",
        multiplierId: multipliers[0].id,
        parcelId: parcels[3].id,
        startDate: new Date("2025-03-05"),
        sowingDate: new Date("2025-04-08"),
        plannedQuantity: 400,
        status: "IN_PROGRESS",
        notes: "Performance correcte observée",
        weatherConditions: "Conditions normales",
      },
    }),
    // Production ISRIZ-17 (Bande 9)
    prisma.production.create({
      data: {
        lotId: "SL-G3-2024-ISRIZ17",
        multiplierId: multipliers[0].id,
        parcelId: parcels[2].id,
        startDate: new Date("2025-03-07"),
        sowingDate: new Date("2025-04-16"),
        plannedQuantity: 380,
        status: "IN_PROGRESS",
        notes: "Présence de mauvaises herbes signalée",
        weatherConditions: "Conditions variables",
      },
    }),
  ]);

  console.log("🚜 Productions créées:", productions.length);

  // Créer les activités de production basées sur les données d'irrigation
  await Promise.all([
    // Activités Bande 1 - ISRIZ-15
    prisma.productionActivity.create({
      data: {
        productionId: productions[0].id,
        type: "SOWING",
        activityDate: new Date("2025-02-09"),
        description: "Pépinière - Semis initial ISRIZ-15",
        personnel: ["Équipe technique ISRA"],
        notes: "Début de la campagne 2025",
        userId: users.find((u) => u.role === "TECHNICIAN")!.id,
      },
    }),
    prisma.productionActivity.create({
      data: {
        productionId: productions[0].id,
        type: "IRRIGATION",
        activityDate: new Date("2025-03-16"),
        description: "Irrigation pépinière - Premier arrosage",
        personnel: ["Équipe irrigation"],
        notes: "Mise en eau de la pépinière",
        userId: users.find((u) => u.role === "TECHNICIAN")!.id,
      },
    }),
    prisma.productionActivity.create({
      data: {
        productionId: productions[0].id,
        type: "OTHER",
        activityDate: new Date("2025-03-17"),
        description: "Repiquage - Transplantation",
        personnel: ["Équipe de repiquage"],
        notes: "Repiquage sur 0.5 hectare",
        userId: users.find((u) => u.role === "TECHNICIAN")!.id,
      },
    }),
    prisma.productionActivity.create({
      data: {
        productionId: productions[0].id,
        type: "PEST_CONTROL",
        activityDate: new Date("2025-04-17"),
        description: "Traitement herbicide - Application phytosanitaire",
        personnel: ["Équipe phytosanitaire"],
        notes: "Application de Propanil",
        userId: users.find((u) => u.role === "TECHNICIAN")!.id,
        inputs: {
          create: [
            { name: "Propanil", quantity: "250", unit: "ml", cost: 15000 },
            { name: "Eau", quantity: "30", unit: "litres", cost: 0 },
          ],
        },
      },
    }),
    prisma.productionActivity.create({
      data: {
        productionId: productions[0].id,
        type: "FERTILIZATION",
        activityDate: new Date("2025-04-23"),
        description: "Irrigation + Fertilisation - Urée + DAP",
        personnel: ["Équipe fertilisation"],
        notes: "Application d'engrais",
        userId: users.find((u) => u.role === "TECHNICIAN")!.id,
        inputs: {
          create: [
            { name: "Urée", quantity: "50", unit: "kg", cost: 25000 },
            { name: "DAP", quantity: "25", unit: "kg", cost: 20000 },
          ],
        },
      },
    }),
    prisma.productionActivity.create({
      data: {
        productionId: productions[0].id,
        type: "WEEDING",
        activityDate: new Date("2025-05-14"),
        description: "Désherbage manuel - Entretien",
        personnel: ["Équipe désherbage"],
        notes: "Collecte données densité + biomasse adventices",
        userId: users.find((u) => u.role === "TECHNICIAN")!.id,
      },
    }),
  ]);

  console.log("📝 Activités de production créées");

  // Créer des problèmes de production basés sur les observations
  await Promise.all([
    prisma.productionIssue.create({
      data: {
        productionId: productions[2].id, // ISRIZ-17
        issueDate: new Date("2025-05-01"),
        type: "MANAGEMENT",
        description: "Présence importante de mauvaises herbes",
        severity: "MEDIUM",
        actions: "Désherbage manuel programmé",
        resolved: false,
        cost: 45000,
      },
    }),
    prisma.productionIssue.create({
      data: {
        productionId: productions[0].id,
        issueDate: new Date("2025-05-05"),
        type: "OTHER",
        description: "Assèchement lent de la parcelle",
        severity: "LOW",
        actions: "Ajustement du système d'irrigation",
        resolved: true,
        resolvedDate: new Date("2025-05-08"),
        cost: 25000,
      },
    }),
  ]);

  console.log("⚠️ Problèmes de production créés");

  // Créer des rapports
  await Promise.all([
    prisma.report.create({
      data: {
        title: "Production de semences - Campagne 2024-2025",
        type: "PRODUCTION",
        description:
          "Rapport de suivi de la production de semences de riz et blé",
        createdById: users.find((u) => u.role === "MANAGER")!.id,
        parameters: {
          campaign: "2024-2025",
          crops: ["rice", "wheat"],
          varieties: ["ISRIZ", "SAHEL", "Blé"],
        },
        isPublic: true,
      },
    }),
    prisma.report.create({
      data: {
        title: "Taux de germination - Variétés ISRIZ",
        type: "QUALITY",
        description: "Analyse des taux de germination des variétés ISRIZ",
        createdById: users.find((u) => u.role === "INSPECTOR")!.id,
        parameters: {
          varieties: ["ISRIZ"],
          tests: ["germination"],
          period: "2024-2025",
        },
        isPublic: false,
      },
    }),
    prisma.report.create({
      data: {
        title: "Inventaire semences - Hivernage 2024",
        type: "INVENTORY",
        description: "État des stocks de semences après l'hivernage 2024",
        createdById: users.find((u) => u.role === "MANAGER")!.id,
        parameters: {
          season: "Hivernage 2024",
          levels: ["G3"],
          totalQuantity: 7117, // Total kg selon les données
        },
        isPublic: true,
      },
    }),
  ]);

  console.log("📊 Rapports créés");

  // Créer l'historique de production
  await Promise.all([
    prisma.productionHistory.create({
      data: {
        multiplierId: multipliers[0].id,
        varietyId: riceVarieties.find((v) => v.code === "SAHEL-117")!.id,
        seedLevel: "G3",
        season: "Hivernage",
        year: 2024,
        quantity: 680,
        qualityScore: 92,
      },
    }),
    prisma.productionHistory.create({
      data: {
        multiplierId: multipliers[0].id,
        varietyId: riceVarieties.find((v) => v.code === "SAHEL-108")!.id,
        seedLevel: "G3",
        season: "Hivernage",
        year: 2024,
        quantity: 440,
        qualityScore: 89,
      },
    }),
    prisma.productionHistory.create({
      data: {
        multiplierId: multipliers[0].id,
        varietyId: riceVarieties.find((v) => v.code === "ISRIZ-17")!.id,
        seedLevel: "G3",
        season: "Contre saison",
        year: 2024,
        quantity: 1680,
        qualityScore: 94,
      },
    }),
  ]);

  console.log("📈 Historique de production créé");

  console.log(
    "\n✅ Seeding terminé avec succès avec les données réelles de la Station ISRA Fanaye !"
  );
  console.log("\n🎯 Données créées :");
  console.log("   👥 5 utilisateurs");
  console.log("   🌾 19 variétés:");
  console.log("      - 11 variétés de riz (ISRIZ, SAHEL, IR)");
  console.log("      - 8 variétés de blé (4 blé tendre, 4 blé dur)");
  console.log("   🏢 1 station de multiplication: ISRA Fanaye");
  console.log("   🏞️ 6 parcelles/bandes");
  console.log("   🌱 7 lots de semences certifiés");
  console.log("   🔬 3 contrôles qualité");
  console.log("   🚜 3 productions en cours");
  console.log("   📝 6 activités de production");
  console.log("   ⚠️ 2 problèmes de production");
  console.log("   📊 3 rapports");
  console.log("   📈 3 historiques de production");
  console.log(
    "\n⚠️  Note: Les variétés de blé utilisent temporairement le type SORGHUM."
  );
  console.log(
    "   Recommandation: Ajouter WHEAT à l'enum CropType dans schema.prisma"
  );
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
