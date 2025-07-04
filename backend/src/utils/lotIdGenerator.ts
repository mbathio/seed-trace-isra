import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Génère un ID unique pour un lot de semences
 * Format: SL-[LEVEL]-[YEAR]-[VARIETY]-[SEQUENCE]
 * Exemple: SL-G1-2024-DIH-0001
 */
export async function generateLotId(
  level: string,
  varietyCode: string
): Promise<string> {
  const year = new Date().getFullYear();

  // Récupérer le dernier numéro de séquence pour ce niveau et cette année
  const lastLot = await prisma.seedLot.findFirst({
    where: {
      id: {
        startsWith: `SL-${level}-${year}-`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let sequence = 1;

  if (lastLot) {
    // Extraire le numéro de séquence du dernier lot
    const parts = lastLot.id.split("-");
    const lastSequence = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  // Formater le numéro de séquence sur 4 chiffres
  const sequenceStr = sequence.toString().padStart(4, "0");

  // Construire l'ID final
  return `SL-${level}-${year}-${varietyCode}-${sequenceStr}`;
}
