// backend/src/services/SeedLotService.ts
import { PrismaClient, Prisma, SeedLevel, LotStatus } from "@prisma/client";
import {
  generateLotId,
  getNextLevel,
  isValidLevelTransition,
} from "../utils/seedLotHelpers";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

// Interface pour les erreurs personnalisées
export class SeedLotError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "SeedLotError";
  }
}

// Interface pour les paramètres de requête
interface GetSeedLotsParams {
  page?: string | number;
  pageSize?: string | number;
  search?: string;
  level?: string;
  status?: string;
  varietyId?: string | number;
  multiplierId?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Interface pour les données de création
interface CreateSeedLotData {
  varietyId: number;
  level: string;
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status?: string;
  multiplierId?: number;
  parcelId?: number;
  parentLotId?: string;
  notes?: string;
  batchNumber?: string;
}

// Interface pour les données de mise à jour
interface UpdateSeedLotData {
  quantity?: number;
  status?: string;
  notes?: string;
  multiplierId?: number;
  parcelId?: number;
}

export class SeedLotService {
  /**
   * Créer un nouveau lot de semences
   */
  static async createSeedLot(data: CreateSeedLotData) {
    try {
      logger.info("Creating seed lot", { data });

      // Vérifier l'existence de la variété
      const variety = await prisma.variety.findUnique({
        where: { id: data.varietyId },
      });

      if (!variety) {
        throw new SeedLotError("VARIETY_NOT_FOUND", "Variété non trouvée");
      }

      // Vérifier le lot parent si spécifié
      if (data.parentLotId) {
        const parentLot = await prisma.seedLot.findUnique({
          where: { id: data.parentLotId },
        });

        if (!parentLot) {
          throw new SeedLotError(
            "PARENT_LOT_NOT_FOUND",
            "Lot parent non trouvé"
          );
        }

        // Vérifier la cohérence de la hiérarchie
        if (!isValidLevelTransition(parentLot.level, data.level)) {
          const expectedLevel = getNextLevel(parentLot.level);
          throw new SeedLotError(
            "INVALID_HIERARCHY",
            `Le niveau doit être ${expectedLevel} pour un lot enfant de ${parentLot.level}`
          );
        }
      }

      // Générer l'ID du lot
      const lotId = await generateLotId(data.level, variety.code);

      // Convertir level et status en enums Prisma
      const seedLevel = data.level as SeedLevel;
      const lotStatus = (data.status || "PENDING") as LotStatus;

      // Créer le lot
      const seedLot = await prisma.seedLot.create({
        data: {
          id: lotId,
          variety: { connect: { id: data.varietyId } },
          level: seedLevel, // Utiliser l'enum
          quantity: data.quantity,
          productionDate: new Date(data.productionDate),
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
          status: lotStatus, // Utiliser l'enum
          multiplier: data.multiplierId
            ? { connect: { id: data.multiplierId } }
            : undefined,
          parcel: data.parcelId
            ? { connect: { id: data.parcelId } }
            : undefined,
          parentLot: data.parentLotId
            ? { connect: { id: data.parentLotId } }
            : undefined,
          notes: data.notes,
          batchNumber: data.batchNumber,
        },
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          parentLot: true,
        },
      });

      logger.info(`Seed lot created successfully: ${seedLot.id}`);
      return seedLot;
    } catch (error) {
      logger.error("Error creating seed lot", { error });
      throw error;
    }
  }

  /**
   * Récupérer la liste des lots avec pagination et filtres
   */
  static async getSeedLots(params: GetSeedLotsParams) {
    try {
      // Paramètres de pagination
      const page = Number(params.page) || 1;
      const pageSize = Number(params.pageSize) || 10;
      const skip = (page - 1) * pageSize;

      // Construction de la clause WHERE
      const where: Prisma.SeedLotWhereInput = {};

      // Recherche textuelle
      if (params.search) {
        where.OR = [
          { id: { contains: params.search, mode: "insensitive" } },
          { notes: { contains: params.search, mode: "insensitive" } },
          {
            variety: {
              OR: [
                { name: { contains: params.search, mode: "insensitive" } },
                { code: { contains: params.search, mode: "insensitive" } },
              ],
            },
          },
        ];
      }

      // Filtres spécifiques avec conversion en enums
      if (params.level) {
        where.level = params.level as SeedLevel;
      }
      if (params.status) {
        where.status = params.status as LotStatus;
      }
      if (params.varietyId) {
        where.varietyId = Number(params.varietyId);
      }
      if (params.multiplierId) {
        where.multiplierId = Number(params.multiplierId);
      }

      // Tri
      const orderBy: any = {};
      const sortBy = params.sortBy || "createdAt";
      const sortOrder = params.sortOrder || "desc";
      orderBy[sortBy] = sortOrder;

      // Exécution des requêtes en parallèle
      const [seedLots, totalCount] = await Promise.all([
        prisma.seedLot.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            variety: true,
            multiplier: true,
            parentLot: {
              include: {
                variety: true,
              },
            },
            qualityControls: {
              orderBy: {
                controlDate: "desc",
              },
              take: 1,
            },
            _count: {
              select: {
                childLots: true,
              },
            },
          },
        }),
        prisma.seedLot.count({ where }),
      ]);

      // Calcul des métadonnées
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: seedLots,
        meta: {
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error fetching seed lots", { error });
      throw error;
    }
  }

  /**
   * Récupérer un lot par son ID
   */
  static async getSeedLotById(id: string) {
    try {
      const seedLot = await prisma.seedLot.findUnique({
        where: { id },
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          parentLot: {
            include: {
              variety: true,
            },
          },
          childLots: {
            include: {
              variety: true,
            },
          },
          qualityControls: {
            orderBy: {
              controlDate: "desc",
            },
          },
          productions: {
            include: {
              activities: true,
            },
          },
        },
      });

      if (!seedLot) {
        throw new SeedLotError("LOT_NOT_FOUND", "Lot non trouvé");
      }

      return seedLot;
    } catch (error) {
      logger.error("Error fetching seed lot", { error, id });
      throw error;
    }
  }

  /**
   * Mettre à jour un lot
   */
  static async updateSeedLot(id: string, data: UpdateSeedLotData) {
    try {
      // Vérifier l'existence du lot
      const existingLot = await prisma.seedLot.findUnique({
        where: { id },
      });

      if (!existingLot) {
        throw new SeedLotError("LOT_NOT_FOUND", "Lot non trouvé");
      }

      // Construire l'objet de mise à jour avec les relations Prisma
      const updateData: Prisma.SeedLotUpdateInput = {
        quantity: data.quantity,
        notes: data.notes,
      };

      // Ajouter status seulement s'il est fourni
      if (data.status) {
        updateData.status = data.status as LotStatus;
      }

      // Gérer les relations avec connect/disconnect
      if (data.multiplierId !== undefined) {
        updateData.multiplier = data.multiplierId
          ? { connect: { id: data.multiplierId } }
          : { disconnect: true };
      }

      if (data.parcelId !== undefined) {
        updateData.parcel = data.parcelId
          ? { connect: { id: data.parcelId } }
          : { disconnect: true };
      }

      // Mettre à jour le lot
      const updatedLot = await prisma.seedLot.update({
        where: { id },
        data: updateData,
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
        },
      });

      logger.info(`Seed lot updated: ${id}`);
      return updatedLot;
    } catch (error) {
      logger.error("Error updating seed lot", { error, id });
      throw error;
    }
  }

  /**
   * Supprimer un lot
   */
  static async deleteSeedLot(id: string) {
    try {
      // Vérifier l'existence et les dépendances
      const seedLot = await prisma.seedLot.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              childLots: true,
              qualityControls: true,
              productions: true,
            },
          },
        },
      });

      if (!seedLot) {
        throw new SeedLotError("LOT_NOT_FOUND", "Lot non trouvé");
      }

      // Empêcher la suppression si le lot a des enfants
      if (seedLot._count.childLots > 0) {
        throw new SeedLotError(
          "HAS_CHILD_LOTS",
          "Impossible de supprimer un lot qui a des lots enfants"
        );
      }

      // Supprimer le lot
      await prisma.seedLot.delete({
        where: { id },
      });

      logger.info(`Seed lot deleted: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error("Error deleting seed lot", { error, id });
      throw error;
    }
  }

  /**
   * Créer un lot enfant à partir d'un lot parent
   */
  static async createChildLot(
    parentId: string,
    data: Omit<CreateSeedLotData, "parentLotId" | "level">
  ) {
    try {
      // Récupérer le lot parent
      const parentLot = await prisma.seedLot.findUnique({
        where: { id: parentId },
        include: { variety: true },
      });

      if (!parentLot) {
        throw new SeedLotError("PARENT_LOT_NOT_FOUND", "Lot parent non trouvé");
      }

      // Déterminer le niveau du lot enfant
      const childLevel = getNextLevel(parentLot.level);
      if (!childLevel) {
        throw new SeedLotError(
          "INVALID_HIERARCHY",
          `Le lot ${parentLot.level} ne peut pas avoir de lots enfants`
        );
      }

      // Vérifier la quantité disponible
      if (data.quantity > parentLot.quantity) {
        throw new SeedLotError(
          "INSUFFICIENT_QUANTITY",
          "Quantité demandée supérieure à la quantité disponible du lot parent"
        );
      }

      // Créer le lot enfant
      const childLot = await this.createSeedLot({
        ...data,
        level: childLevel,
        parentLotId: parentId,
      });

      // Mettre à jour la quantité du lot parent
      await prisma.seedLot.update({
        where: { id: parentId },
        data: {
          quantity: parentLot.quantity - data.quantity,
        },
      });

      return childLot;
    } catch (error) {
      logger.error("Error creating child lot", { error, parentId });
      throw error;
    }
  }

  /**
   * Récupérer l'arbre généalogique d'un lot
   */
  static async getGenealogyTree(id: string) {
    try {
      const buildTree = async (
        lotId: string,
        depth: number = 0
      ): Promise<any> => {
        if (depth > 10) return null; // Limite de profondeur

        const lot = await prisma.seedLot.findUnique({
          where: { id: lotId },
          include: {
            variety: true,
            childLots: true,
          },
        });

        if (!lot) return null;

        const children = await Promise.all(
          lot.childLots.map((child) => buildTree(child.id, depth + 1))
        );

        return {
          id: lot.id,
          level: lot.level,
          variety: lot.variety,
          quantity: lot.quantity,
          productionDate: lot.productionDate,
          status: lot.status,
          children: children.filter(Boolean),
        };
      };

      const genealogyTree = await buildTree(id);

      if (!genealogyTree) {
        throw new SeedLotError("LOT_NOT_FOUND", "Lot non trouvé");
      }

      return genealogyTree;
    } catch (error) {
      logger.error("Error fetching genealogy tree", { error, id });
      throw error;
    }
  }

  /**
   * Transférer un lot entre multiplicateurs
   */
  static async transferLot(
    lotId: string,
    targetMultiplierId: number,
    quantity: number,
    notes?: string
  ) {
    try {
      // Vérifier le lot source
      const sourceLot = await prisma.seedLot.findUnique({
        where: { id: lotId },
      });

      if (!sourceLot) {
        throw new SeedLotError("SOURCE_LOT_NOT_FOUND", "Lot source non trouvé");
      }

      if (quantity > sourceLot.quantity) {
        throw new SeedLotError(
          "INSUFFICIENT_QUANTITY",
          "Quantité insuffisante dans le lot source"
        );
      }

      // Vérifier le multiplicateur cible
      const targetMultiplier = await prisma.multiplier.findUnique({
        where: { id: targetMultiplierId },
      });

      if (!targetMultiplier) {
        throw new SeedLotError(
          "MULTIPLIER_NOT_FOUND",
          "Multiplicateur non trouvé"
        );
      }

      // Créer le lot transféré
      const transferredLot = await this.createSeedLot({
        varietyId: sourceLot.varietyId,
        level: sourceLot.level,
        quantity,
        productionDate: sourceLot.productionDate.toISOString(),
        multiplierId: targetMultiplierId,
        parentLotId: lotId,
        notes: notes || `Transféré depuis ${lotId}`,
        status: sourceLot.status, // Conserver le statut du lot source
      });

      // Mettre à jour la quantité du lot source
      await prisma.seedLot.update({
        where: { id: lotId },
        data: {
          quantity: sourceLot.quantity - quantity,
        },
      });

      return transferredLot;
    } catch (error) {
      logger.error("Error transferring lot", { error, lotId });
      throw error;
    }
  }
}
