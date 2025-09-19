// backend/src/services/SeedLotService.ts - VERSION UNIFIÉE CORRIGÉE

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

const prisma = new PrismaClient();

interface CreateSeedLotData {
  varietyId: number;
  level: SeedLevel;
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status?: LotStatus;
  multiplierId?: number;
  parcelId?: number;
  parentLotId?: string;
  notes?: string;
  batchNumber?: string;
}

interface UpdateSeedLotData {
  quantity?: number;
  status?: LotStatus;
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
  level?: SeedLevel;
  status?: LotStatus;
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
   * ✅ CREATE - Créer un nouveau lot de semences
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

      // 6. Créer le lot dans une transaction
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const seedLot = await tx.seedLot.create({
            data: {
              id: lotId,
              variety: { connect: { id: data.varietyId } },
              level: data.level,
              quantity: data.quantity,
              productionDate: new Date(data.productionDate),
              expiryDate,
              status: data.status || LotStatus.pending,
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
      return result;
    } catch (error) {
      logger.error("Error creating seed lot", { error, data });
      throw error;
    }
  }

  /**
   * ✅ READ - Récupérer la liste des lots
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

      // 2. Construction WHERE
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

      // Filtres directs (valeurs Prisma)
      if (filters.level) {
        where.level = filters.level;
      }

      if (filters.status) {
        where.status = filters.status;
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

      // 6. Calculer les quantités disponibles
      const enrichedLots = seedLots.map((lot) => {
        const childLotsQuantity =
          lot.childLots?.reduce(
            (sum: number, child: any) => sum + child.quantity,
            0
          ) || 0;

        return {
          ...lot,
          availableQuantity: lot.quantity - childLotsQuantity,
        };
      });

      // 7. Métadonnées de pagination
      const totalPages = Math.ceil(totalCount / pageSize);

      const result: GetSeedLotsResult = {
        success: true,
        message: `${enrichedLots.length} lots récupérés avec succès`,
        data: enrichedLots,
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
   * ✅ READ - Récupérer un lot par ID
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
        ...seedLot,
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
   * ✅ UPDATE - Mettre à jour
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

      // Construire l'objet de mise à jour
      const updateData: any = { updatedAt: new Date() };

      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.batchNumber !== undefined)
        updateData.batchNumber = data.batchNumber;

      // Status direct
      if (data.status !== undefined) {
        updateData.status = data.status;

        // Validation pour certification
        if (data.status === LotStatus.certified) {
          const hasPassedQC = await prisma.qualityControl.findFirst({
            where: { lotId: id, result: "pass" },
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
      if (data.status === LotStatus.rejected) {
        await NotificationService.notifyLotRejected(updatedLot);
      } else if (data.status === LotStatus.certified) {
        await NotificationService.notifyLotCertified(updatedLot);
      }

      logger.info(`Seed lot updated successfully: ${id}`);
      return updatedLot;
    } catch (error) {
      logger.error("Error updating seed lot", { error, id, data });
      throw error;
    }
  }

  /**
   * ✅ DELETE - Supprimer (soft delete)
   */
  static async deleteSeedLot(id: string, hardDelete = false) {
    try {
      logger.warn("Deleting seed lot", { id, hardDelete });

      // Vérifier que le lot existe
      const seedLot = await prisma.seedLot.findUnique({
        where: { id },
        include: {
          childLots: { where: { isActive: true } },
          productions: true,
          qualityControls: true,
        },
      });

      if (!seedLot) {
        throw new Error(`Lot non trouvé: ${id}`);
      }

      // Vérifier les dépendances
      if (seedLot.childLots.length > 0) {
        throw new Error(
          `Impossible de supprimer le lot: ${seedLot.childLots.length} lots enfants existent`
        );
      }

      if (seedLot.productions.length > 0) {
        throw new Error(
          `Impossible de supprimer le lot: ${seedLot.productions.length} productions associées`
        );
      }

      if (hardDelete) {
        // Suppression définitive
        await prisma.$transaction(async (tx) => {
          // Supprimer les contrôles qualité
          await tx.qualityControl.deleteMany({
            where: { lotId: id },
          });

          // Supprimer le lot
          await tx.seedLot.delete({
            where: { id },
          });
        });
      } else {
        // Soft delete
        await prisma.seedLot.update({
          where: { id },
          data: { isActive: false },
        });
      }

      // Invalider le cache
      await CacheService.invalidate(`seedlot:${id}:*`);
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      logger.info(`Seed lot deleted successfully: ${id}`);
    } catch (error) {
      logger.error("Error deleting seed lot", { error, id });
      throw error;
    }
  }

  /**
   * ✅ Méthodes utilitaires supplémentaires
   */
  static async bulkUpdateSeedLots(
    ids: string[],
    updateData: Partial<UpdateSeedLotData>
  ) {
    try {
      const results = await prisma.$transaction(
        ids.map((id) =>
          prisma.seedLot.update({
            where: { id },
            data: updateData,
          })
        )
      );

      await CacheService.invalidate("seedlots:*");

      return {
        count: results.length,
        message: `${results.length} lots mis à jour avec succès`,
      };
    } catch (error) {
      logger.error("Error in bulk update", { error, ids });
      throw error;
    }
  }

  static async searchSeedLots(criteria: {
    query?: string;
    filters?: any;
    dateRange?: any;
    includeExpired?: boolean;
    includeInactive?: boolean;
  }) {
    try {
      const where: any = {};

      if (!criteria.includeInactive) {
        where.isActive = true;
      }

      if (!criteria.includeExpired) {
        where.expiryDate = {
          gte: new Date(),
        };
      }

      if (criteria.query) {
        where.OR = [
          { id: { contains: criteria.query, mode: "insensitive" } },
          { notes: { contains: criteria.query, mode: "insensitive" } },
          { batchNumber: { contains: criteria.query, mode: "insensitive" } },
          {
            variety: {
              OR: [
                { name: { contains: criteria.query, mode: "insensitive" } },
                { code: { contains: criteria.query, mode: "insensitive" } },
              ],
            },
          },
        ];
      }

      if (criteria.filters) {
        Object.assign(where, criteria.filters);
      }

      if (criteria.dateRange) {
        where.productionDate = {};
        if (criteria.dateRange.start) {
          where.productionDate.gte = new Date(criteria.dateRange.start);
        }
        if (criteria.dateRange.end) {
          where.productionDate.lte = new Date(criteria.dateRange.end);
        }
      }

      const seedLots = await prisma.seedLot.findMany({
        where,
        include: {
          variety: true,
          multiplier: true,
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
        orderBy: { productionDate: "desc" },
        take: 100, // Limiter les résultats de recherche
      });

      return seedLots;
    } catch (error) {
      logger.error("Error in search seed lots", { error, criteria });
      throw error;
    }
  }

  static async exportSeedLots(
    filters: any,
    format: "csv" | "json" | "xlsx"
  ): Promise<any> {
    try {
      const { data } = await this.getSeedLots({
        ...filters,
        pageSize: 10000, // Export toutes les données
      });

      switch (format) {
        case "csv":
          return this.generateCSV(data);
        case "json":
          return JSON.stringify(data, null, 2);
        case "xlsx":
          // TODO: Implémenter Excel
          return this.generateCSV(data);
        default:
          throw new Error(`Format non supporté: ${format}`);
      }
    } catch (error) {
      logger.error("Error exporting seed lots", { error });
      throw error;
    }
  }

  static async createChildLot(parentId: string, data: any) {
    try {
      const parentLot = await prisma.seedLot.findUnique({
        where: { id: parentId },
        include: { variety: true },
      });

      if (!parentLot) {
        throw new Error("Lot parent non trouvé");
      }

      const nextLevel = getNextLevel(parentLot.level);
      if (!nextLevel) {
        throw new Error("Impossible de créer un lot enfant pour ce niveau");
      }

      return await this.createSeedLot({
        ...data,
        varietyId: parentLot.varietyId,
        level: nextLevel as SeedLevel,
        parentLotId: parentId,
      });
    } catch (error) {
      logger.error("Error creating child lot", { error });
      throw error;
    }
  }

  static async transferLot(
    lotId: string,
    targetMultiplierId: number,
    quantity: number,
    notes?: string
  ) {
    try {
      const sourceLot = await prisma.seedLot.findUnique({
        where: { id: lotId },
      });

      if (!sourceLot) {
        throw new Error("Lot source non trouvé");
      }

      if (quantity > sourceLot.quantity) {
        throw new Error("Quantité insuffisante pour le transfert");
      }

      const result = await prisma.$transaction(async (tx) => {
        // Réduire la quantité du lot source
        await tx.seedLot.update({
          where: { id: lotId },
          data: { quantity: sourceLot.quantity - quantity },
        });

        // Créer un nouveau lot pour le destinataire
        const transferLot = await tx.seedLot.create({
          data: {
            id: await generateLotId(sourceLot.level, `TRANSFER`),
            varietyId: sourceLot.varietyId,
            level: sourceLot.level,
            quantity,
            productionDate: sourceLot.productionDate,
            expiryDate: sourceLot.expiryDate,
            status: LotStatus.active,
            multiplierId: targetMultiplierId,
            parentLotId: lotId,
            notes: notes || `Transféré depuis ${lotId}`,
          },
          include: {
            variety: true,
            multiplier: true,
          },
        });

        return transferLot;
      });

      return result;
    } catch (error) {
      logger.error("Error transferring lot", { error });
      throw error;
    }
  }

  static async getSeedLotStats(lotId: string) {
    try {
      const lot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: {
          childLots: true,
          qualityControls: true,
          productions: true,
        },
      });

      if (!lot) {
        throw new Error("Lot non trouvé");
      }

      return this.calculateLotStatistics(lot);
    } catch (error) {
      logger.error("Error getting seed lot stats", { error });
      throw error;
    }
  }

  static async getSeedLotHistory(lotId: string) {
    try {
      // Pour l'instant, retourner un historique basique
      const activities = await prisma.productionActivity.findMany({
        where: {
          production: {
            lotId: lotId,
          },
        },
        include: {
          user: { select: { name: true } },
          production: { select: { id: true } },
        },
        orderBy: { activityDate: "desc" },
      });

      const qualityControls = await prisma.qualityControl.findMany({
        where: { lotId },
        include: {
          inspector: { select: { name: true } },
        },
        orderBy: { controlDate: "desc" },
      });

      return {
        activities,
        qualityControls,
      };
    } catch (error) {
      logger.error("Error getting seed lot history", { error });
      throw error;
    }
  }

  static async validateSeedLot(lotId: string) {
    try {
      const lot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: {
          variety: true,
          qualityControls: true,
        },
      });

      if (!lot) {
        return {
          isValid: false,
          errors: ["Lot non trouvé"],
        };
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      // Vérifications de base
      if (lot.quantity <= 0) {
        errors.push("Quantité invalide");
      }

      if (lot.expiryDate && lot.expiryDate < new Date()) {
        warnings.push("Lot expiré");
      }

      // Vérifications contrôle qualité
      const hasQualityControl = lot.qualityControls.length > 0;
      if (!hasQualityControl && lot.status === LotStatus.certified) {
        errors.push("Aucun contrôle qualité pour un lot certifié");
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      logger.error("Error validating seed lot", { error });
      throw error;
    }
  }

  // ✅ Méthodes utilitaires privées
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

  private static generateCSV(data: any[]): string {
    if (!data.length) return "";

    const headers = [
      "ID",
      "Niveau",
      "Variété",
      "Quantité (kg)",
      "Statut",
      "Date Production",
      "Date Expiration",
      "Multiplicateur",
    ];

    const rows = data.map((lot) => [
      lot.id,
      lot.level,
      lot.variety?.name || "N/A",
      lot.quantity,
      lot.status,
      new Date(lot.productionDate).toLocaleDateString("fr-FR"),
      lot.expiryDate
        ? new Date(lot.expiryDate).toLocaleDateString("fr-FR")
        : "N/A",
      lot.multiplier?.name || "N/A",
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }
}
