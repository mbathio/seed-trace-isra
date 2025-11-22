// backend/src/utils/seedLotHelpers.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Génère un ID unique pour un lot de semences
 * Format: SL-[LEVEL]-[YEAR]-[SEQUENCE]
 * Exemple: SL-G1-2024-001
 */
export async function generateLotId(
  level: string,
  varietyCode: string
): Promise<string> {
  const year = new Date().getFullYear();

  // Compter les lots existants pour cette année et ce niveau
  const count = await prisma.seedLot.count({
    where: {
      id: {
        startsWith: `SL-${level}-${year}-`,
      },
    },
  });

  // Générer le numéro de séquence
  const sequence = (count + 1).toString().padStart(3, "0");

  // Retourner l'ID formaté
  return `SL-${level}-${year}-${sequence}`;
}

/**
 * Génère un numéro de lot (batch number)
 * Format: [VARIETY_CODE]-[YYMMDD]-[SEQUENCE]
 * Exemple: SH108-240315-01
 */
export function generateBatchNumber(
  varietyCode: string,
  date: Date = new Date()
): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Générer un numéro de séquence aléatoire pour éviter les collisions
  const sequence = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");

  return `${varietyCode.toUpperCase()}-${year}${month}${day}-${sequence}`;
}

/**
 * Vérifie si un lot peut avoir des enfants selon son niveau
 */
export function canHaveChildren(level: string): boolean {
  const nonReproductiveLevels = ["R2", "N"];
  return !nonReproductiveLevels.includes(level);
}

/**
 * Détermine le niveau suivant dans la hiérarchie
 */
export function getNextLevel(currentLevel: string): string | null {
  const levelHierarchy: Record<string, string> = {
    GO: "G1",
    G0: "G1",
    G1: "G2",
    G2: "G3",
    G3: "G4",
    G4: "R1",
    R1: "R2",
    R2: "N",
  };

  return levelHierarchy[currentLevel] || null;
}

/**
 * Vérifie si une transition de niveau est valide
 */
export function isValidLevelTransition(
  parentLevel: string,
  childLevel: string
): boolean {
  const expectedLevel = getNextLevel(parentLevel);
  return expectedLevel === childLevel;
}

/**
 * Calcule la date d'expiration estimée d'un lot
 * Basé sur le niveau et le type de culture
 */
export function calculateExpiryDate(
  productionDate: Date,
  level: string,
  cropType?: string
): Date {
  const expiryDate = new Date(productionDate);

  // Durées de conservation par défaut (en mois)
  const defaultShelfLife: Record<string, number> = {
    GO: 12,
    G0: 12,
    G1: 18,
    G2: 18,
    G3: 24,
    G4: 24,
    R1: 36,
    R2: 36,
    N: 48,
  };

  // Ajustements selon le type de culture
  const cropAdjustments: Record<string, number> = {
    RICE: 6, // +6 mois pour le riz
    MAIZE: -3, // -3 mois pour le maïs
    PEANUT: -6, // -6 mois pour l'arachide
    SORGHUM: 0,
    COWPEA: -3,
    MILLET: 0,
    WHEAT: 3,
  };

  const baseShelfLife = defaultShelfLife[level] || 24;
  const adjustment = cropType ? cropAdjustments[cropType] || 0 : 0;

  expiryDate.setMonth(expiryDate.getMonth() + baseShelfLife + adjustment);

  return expiryDate;
}

/**
 * Formate un ID de lot pour l'affichage
 */
export function formatLotId(lotId: string): string {
  // SL-G1-2024-001 -> G1-2024-001
  return lotId.replace("SL-", "");
}

/**
 * Parse un ID de lot pour extraire ses composants
 */
export function parseLotId(lotId: string): {
  level: string;
  year: number;
  sequence: number;
} | null {
  const match = lotId.match(/^SL-([A-Z0-9]+)-(\d{4})-(\d{3})$/);

  if (!match) {
    return null;
  }

  return {
    level: match[1],
    year: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10),
  };
}

/**
 * Valide la quantité minimale selon le niveau
 */
export function validateMinimumQuantity(
  level: string,
  quantity: number
): boolean {
  const minimumQuantities: Record<string, number> = {
    GO: 50,
    G0: 50,
    G1: 100,
    G2: 200,
    G3: 300,
    G4: 500,
    R1: 1000,
    R2: 2000,
    N: 5000,
  };

  const minimum = minimumQuantities[level] || 100;
  return quantity >= minimum;
}

/**
 * Calcule le taux de multiplication entre deux niveaux
 */
export function calculateMultiplicationRate(
  parentQuantity: number,
  childQuantity: number
): number {
  if (parentQuantity === 0) return 0;
  return Math.round((childQuantity / parentQuantity) * 100) / 100;
}

/**
 * Génère l'ID d'un lot enfant basé sur un lot parent
 * Exemple: parent = SL-G3-2024-SAHEL117 → SL-G4-2025-SAHEL117
 */
export function generateChildLotId(
  parentLotId: string,
  nextLevel: string,
  productionDate: Date
): string {
  // Exemple de parentLotId : SL-G3-2024-SAHEL117
  const parts = parentLotId.split("-");

  const prefix = parts[0] || "SL"; // SL
  const varietalCode = parts[3] || parts[parts.length - 1]; // SAHEL117

  // L'année vient de la date de production (date de récolte en général)
  const year = productionDate.getFullYear();

  return `${prefix}-${nextLevel}-${year}-${varietalCode}`;
}
