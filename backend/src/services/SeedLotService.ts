// backend/src/services/SeedLotService.ts - VERSION UNIFIÉE (sans transformation)

import { PrismaClient, Prisma, SeedLevel, LotStatus } from "@prisma/client";
import {
  generateLotId,
  getNextLevel,
  isValidLevelTransition,
  calculateExpiryDate,
} from "../utils/seedLotHelpers";
import { logger } from "../utils/logger";
import { CacheService } from "./CacheService";
import { NotificationService } from "./NotificationService";
import { ValidationService } from "./ValidationService";
import { GenealogyService } from "./GenealogyService";

const prisma = new PrismaClient();

interface CreateSeedLotData {
  varietyId: number;
  level: SeedLevel; // ✅ Utilise directement l'enum Prisma
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status?: LotStatus; // ✅ Utilise directement l'enum Prisma
  multiplierId?: number;
  parcelId?: number;
  parentLotId?: string;
  notes?: string;
  batchNumber?: string;
}

interface UpdateSeedLotData {
  quantity?: number;
  status?: LotStatus; // ✅ Utilise directement l'enum Prisma
  notes?: string;
  expiryDate?: string;
  batchNumber?: string;
  multiplierId?: number;
  parcelId?: number;
}

interface SeedLotFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  level?: SeedLevel; // ✅ Utilise directement l'enum Prisma
  status?: LotStatus; // ✅ Utilise directement l'enum Prisma
  varietyId?: number;
  multiplierId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeRelations?: boolean;
}

interface GetSeedLotsResult {
  success: boolean;
  message: string;
  data: any[];
  meta: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class SeedLotService {
  /**
   * ✅ CREATE - Créer un nouveau lot de semences (sans transformation)
   */
  static async createSeedLot(data: CreateSeedLotData) {
    try {
      logger.info("Creating seed lot", { data });

      // 1. Validation des données
      const validationResult = ValidationService.validateSeedLotData(data);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // 2. Vérifier l'existence de la variété
      const variety = await prisma.variety.findUnique({
        where: { id: data.varietyId },
        select: { id: true, code: true, cropType: true, isActive: true },
      });

      if (!variety || !variety.isActive) {
        throw new Error("Variété non trouvée ou inactive");
      }

      // 3. Vérifier le lot parent si spécifié
      if (data.parentLotId) {
        const parentLot = await prisma.seedLot.findUnique({
          where: { id: data.parentLotId, isActive: true },
        });

        if (!parentLot) {
          throw new Error("Lot parent non trouvé ou inactif");
        }

        // Vérifier la hiérarchie des niveaux
        if (!isValidLevelTransition(parentLot.level, data.level)) {
          const expectedLevel = getNextLevel(parentLot.level);
          throw new Error(
            `Le niveau doit être ${expectedLevel} pour un lot enfant de ${parentLot.level}`
          );
        }

        // Vérifier la quantité disponible
        if (data.quantity > parentLot.quantity) {
          throw new Error(
            `Quantité demandée (${data.quantity}kg) supérieure à la quantité disponible du parent (${parentLot.quantity}kg)`
          );
        }
      }

      // 4. Générer l'ID unique du lot
      const lotId = await generateLotId(data.level, variety.code);

      // 5. Calculer la date d'expiration si non fournie
      const expiryDate = data.expiryDate
        ? new Date(data.expiryDate)
        : calculateExpiryDate(
            new Date(data.productionDate),
            data.level,
            variety.cropType
          );

      // 6. Créer le lot dans une transaction (SANS transformation)
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const seedLot = await tx.seedLot.create({
            data: {
              id: lotId,
              variety: { connect: { id: data.varietyId } },
              level: data.level, // ✅ Valeur directe Prisma
              quantity: data.quantity,
              productionDate: new Date(data.productionDate),
              expiryDate,
              status: data.status || LotStatus.PENDING, // ✅ Valeur directe Prisma
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
              batchNumber: data.batchNumber || `${variety.code}-${Date.now()}`,
            },
            include: {
              variety: true,
              multiplier: true,
              parcel: true,
              parentLot: true,
            },
          });

          // Mettre à jour la quantité du lot parent si applicable
          if (data.parentLotId) {
            await tx.seedLot.update({
              where: { id: data.parentLotId },
              data: {
                quantity: {
                  decrement: data.quantity,
                },
              },
            });
          }

          return seedLot;
        }
      );

      // 7. Invalider le cache et notifications
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      if (data.parentLotId) {
        await NotificationService.notifyLotCreatedFromParent(
          result,
          data.parentLotId
        );
      }

      logger.info(`Seed lot created successfully: ${result.id}`);
      return result; // ✅ Retourne directement les données Prisma
    } catch (error) {
      logger.error("Error creating seed lot", { error, data });
      throw error;
    }
  }

  /**
   * ✅ READ - Récupérer la liste des lots (sans transformation)
   */
  static async getSeedLots(
    filters: SeedLotFilters = {}
  ): Promise<GetSeedLotsResult> {
    try {
      console.log("🔍 [SERVICE] Getting seed lots with filters", { filters });

      // 1. Paramètres de pagination
      const page = Math.max(1, filters.page || 1);
      const pageSize = Math.min(Math.max(1, filters.pageSize || 10), 100);
      const skip = (page - 1) * pageSize;

      // 2. Construction WHERE (utilise directement les enums Prisma)
      const where: any = { isActive: true };

      // Recherche textuelle
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        where.OR = [
          { id: { contains: searchTerm, mode: "insensitive" } },
          { notes: { contains: searchTerm, mode: "insensitive" } },
          { batchNumber: { contains: searchTerm, mode: "insensitive" } },
          {
            variety: {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { code: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
          {
            multiplier: {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { address: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
        ];
      }

      // ✅ CORRECTION: Filtres directs (pas de transformation)
      if (filters.level) {
        where.level = filters.level; // ✅ Valeur Prisma directe
      }

      if (filters.status) {
        where.status = filters.status; // ✅ Valeur Prisma directe
      }

      if (filters.varietyId && filters.varietyId > 0) {
        where.varietyId = filters.varietyId;
      }

      if (filters.multiplierId && filters.multiplierId > 0) {
        where.multiplierId = filters.multiplierId;
      }

      // Filtres de date
      if (filters.startDate || filters.endDate) {
        where.productionDate = {};
        if (filters.startDate) {
          try {
            where.productionDate.gte = new Date(filters.startDate);
          } catch (error) {
            console.warn("Invalid startDate:", filters.startDate);
          }
        }
        if (filters.endDate) {
          try {
            where.productionDate.lte = new Date(filters.endDate);
          } catch (error) {
            console.warn("Invalid endDate:", filters.endDate);
          }
        }
      }

      // 3. Options de tri
      const validSortFields = [
        "id",
        "level",
        "quantity",
        "productionDate",
        "createdAt",
        "updatedAt",
      ];
      const sortBy = validSortFields.includes(filters.sortBy || "")
        ? filters.sortBy
        : "createdAt";
      const sortOrder = filters.sortOrder === "asc" ? "asc" : "desc";

      const orderBy: any = {};
      if ((sortBy || "").includes(".")) {
        const [relation, field] = (sortBy || "").split(".");
        if (relation && field) {
          orderBy[relation] = { [field]: sortOrder };
        }
      } else if (sortBy) {
        orderBy[sortBy] = sortOrder;
      }

      // 4. Relations à inclure
      const includeRelations = filters.includeRelations !== false;
      const include = {
        variety: true,
        multiplier: true,
        parcel: true,
        parentLot: includeRelations
          ? { include: { variety: true } }
          : undefined,
        childLots: {
          where: { isActive: true },
          include: { variety: true },
          orderBy: { productionDate: Prisma.SortOrder.desc },
        },
        qualityControls: includeRelations
          ? {
              orderBy: { controlDate: Prisma.SortOrder.desc },
              take: 3,
            }
          : undefined,
        productions: includeRelations
          ? {
              orderBy: { startDate: Prisma.SortOrder.desc },
              take: 3,
            }
          : undefined,
        _count: includeRelations
          ? {
              select: {
                childLots: true,
                qualityControls: true,
                productions: true,
              },
            }
          : undefined,
      };

      // 5. Exécuter les requêtes
      const [seedLots, totalCount] = await Promise.all([
        prisma.seedLot.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include,
        }),
        prisma.seedLot.count({ where }),
      ]);

      // 6. Calculer les quantités disponibles (SANS transformation)
      const enrichedLots = seedLots.map((lot) => {
        const childLotsQuantity =
          lot.childLots?.reduce(
            (sum: number, child: any) => sum + child.quantity,
            0
          ) || 0;

        return {
          ...lot, // ✅ Données Prisma directes
          availableQuantity: lot.quantity - childLotsQuantity,
        };
      });

      // 7. Métadonnées de pagination
      const totalPages = Math.ceil(totalCount / pageSize);

      const result: GetSeedLotsResult = {
        success: true,
        message: `${enrichedLots.length} lots récupérés avec succès`,
        data: enrichedLots, // ✅ Données Prisma directes
        meta: {
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };

      return result;
    } catch (error) {
      console.error("❌ [SERVICE] Error fetching seed lots:", error);
      logger.error("Error fetching seed lots", { error, filters });

      return {
        success: false,
        message: "Erreur lors de la récupération des lots",
        data: [],
        meta: {
          totalCount: 0,
          page: filters.page || 1,
          pageSize: filters.pageSize || 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  }

  /**
   * ✅ READ - Récupérer un lot par ID (sans transformation)
   */
  static async getSeedLotById(id: string, includeFullDetails = true) {
    try {
      const cacheKey = `seedlot:${id}:${includeFullDetails}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const seedLot = await prisma.seedLot.findUnique({
        where: { id, isActive: true },
        include: includeFullDetails
          ? {
              variety: { include: { _count: { select: { seedLots: true } } } },
              multiplier: {
                include: {
                  _count: { select: { seedLots: true, productions: true } },
                },
              },
              parcel: {
                include: {
                  soilAnalyses: {
                    orderBy: { analysisDate: "desc" },
                    take: 1,
                  },
                },
              },
              parentLot: { include: { variety: true, multiplier: true } },
              childLots: {
                include: {
                  variety: true,
                  qualityControls: {
                    orderBy: { controlDate: "desc" },
                    take: 1,
                  },
                },
                orderBy: { productionDate: "desc" },
              },
              qualityControls: {
                include: {
                  inspector: { select: { id: true, name: true, email: true } },
                },
                orderBy: { controlDate: "desc" },
              },
              productions: {
                include: {
                  activities: {
                    orderBy: { activityDate: "desc" },
                    take: 5,
                  },
                  issues: { where: { resolved: false } },
                  _count: { select: { activities: true, issues: true } },
                },
                orderBy: { startDate: "desc" },
              },
            }
          : {
              variety: true,
              multiplier: true,
            },
      });

      if (!seedLot) {
        throw new Error(`Lot non trouvé: ${id}`);
      }

      // Ajouter des statistiques si détails complets
      const stats = includeFullDetails
        ? await this.calculateLotStatistics(seedLot)
        : null;

      const result = {
        ...seedLot, // ✅ Données Prisma directes
        statistics: stats,
      };

      await CacheService.set(cacheKey, result, 600);
      return result;
    } catch (error) {
      logger.error("Error fetching seed lot by id", { error, id });
      throw error;
    }
  }

  /**
   * ✅ UPDATE - Mettre à jour (sans transformation)
   */
  static async updateSeedLot(id: string, data: UpdateSeedLotData) {
    try {
      logger.info("Updating seed lot", { id, data });

      const existingLot = await prisma.seedLot.findUnique({
        where: { id, isActive: true },
        include: {
          variety: true,
          _count: { select: { childLots: true } },
        },
      });

      if (!existingLot) {
        throw new Error(`Lot non trouvé ou inactif: ${id}`);
      }

      // Construire l'objet de mise à jour (SANS transformation)
      const updateData: any = { updatedAt: new Date() };

      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.batchNumber !== undefined)
        updateData.batchNumber = data.batchNumber;

      // ✅ CORRECTION: Status direct sans transformation
      if (data.status !== undefined) {
        updateData.status = data.status; // ✅ Valeur Prisma directe

        // Validation pour certification
        if (data.status === LotStatus.CERTIFIED) {
          const hasPassedQC = await prisma.qualityControl.findFirst({
            where: { lotId: id, result: "PASS" },
          });

          if (!hasPassedQC) {
            throw new Error(
              "Le lot doit avoir au moins un contrôle qualité réussi pour être certifié"
            );
          }
        }
      }

      if (data.expiryDate !== undefined) {
        updateData.expiryDate = data.expiryDate
          ? new Date(data.expiryDate)
          : null;
      }

      // Gérer les relations
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

      // Effectuer la mise à jour
      const updatedLot = await prisma.seedLot.update({
        where: { id },
        data: updateData,
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
      });

      // Invalider le cache et notifications
      await CacheService.invalidate(`seedlot:${id}:*`);
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      // Notifications
      if (data.status === LotStatus.REJECTED) {
        await NotificationService.notifyLotRejected(updatedLot);
      } else if (data.status === LotStatus.CERTIFIED) {
        await NotificationService.notifyLotCertified(updatedLot);
      }

      logger.info(`Seed lot updated successfully: ${id}`);
      return updatedLot; // ✅ Données Prisma directes
    } catch (error) {
      logger.error("Error updating seed lot", { error, id, data });
      throw error;
    }
  }

  // ✅ Autres méthodes similaires (DELETE, etc.) - toutes sans transformation
  // ... (garder la même logique mais sans DataTransformer)

  private static async calculateLotStatistics(lot: any) {
    const stats = {
      totalChildLots: lot.childLots?.length || 0,
      totalQualityControls: lot.qualityControls?.length || 0,
      passedQualityControls:
        lot.qualityControls?.filter((qc: any) => qc.result === "PASS").length ||
        0,
      averageGerminationRate: 0,
      lastControlDate: null as Date | null,
      daysUntilExpiry: null as number | null,
      totalQuantityInChildren: 0,
    };

    if (lot.qualityControls && lot.qualityControls.length > 0) {
      const totalGermination = lot.qualityControls.reduce(
        (sum: number, qc: any) => sum + qc.germinationRate,
        0
      );
      stats.averageGerminationRate =
        totalGermination / lot.qualityControls.length;
      stats.lastControlDate = lot.qualityControls[0].controlDate;
    }

    if (lot.expiryDate) {
      stats.daysUntilExpiry = Math.floor(
        (new Date(lot.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
    }

    if (lot.childLots) {
      stats.totalQuantityInChildren = lot.childLots.reduce(
        (sum: number, child: any) => sum + child.quantity,
        0
      );
    }

    return stats;
  }
}
