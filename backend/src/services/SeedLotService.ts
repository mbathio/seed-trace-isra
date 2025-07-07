// backend/src/services/SeedLotService.ts

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

// Types et interfaces
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

interface UpdateSeedLotData {
  quantity?: number;
  status?: string;
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
  level?: string;
  status?: string;
  varietyId?: number;
  multiplierId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeRelations?: boolean;
}

export class SeedLotService {
  /**
   * CREATE - Créer un nouveau lot de semences
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
        where: { id: data.varietyId, isActive: true },
      });

      if (!variety) {
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
      const result = await prisma.$transaction(async (tx) => {
        // Créer le nouveau lot
        const seedLot = await tx.seedLot.create({
          data: {
            id: lotId,
            variety: { connect: { id: data.varietyId } },
            level: data.level as SeedLevel,
            quantity: data.quantity,
            productionDate: new Date(data.productionDate),
            expiryDate,
            status: (data.status || "PENDING") as LotStatus,
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
      });

      // 7. Invalider le cache
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      // 8. Notifications
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
   * READ - Récupérer la liste des lots avec pagination et filtres
   */
  static async getSeedLots(filters: SeedLotFilters = {}) {
    try {
      // 1. Paramètres de pagination
      const page = filters.page || 1;
      const pageSize = Math.min(filters.pageSize || 10, 100);
      const skip = (page - 1) * pageSize;

      // 2. Construction des conditions WHERE
      const where: Prisma.SeedLotWhereInput = {
        isActive: true,
      };

      // Recherche textuelle
      if (filters.search) {
        where.OR = [
          { id: { contains: filters.search, mode: "insensitive" } },
          { notes: { contains: filters.search, mode: "insensitive" } },
          { batchNumber: { contains: filters.search, mode: "insensitive" } },
          {
            variety: {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { code: { contains: filters.search, mode: "insensitive" } },
              ],
            },
          },
          {
            multiplier: {
              name: { contains: filters.search, mode: "insensitive" },
            },
          },
        ];
      }

      // Filtres spécifiques
      if (filters.level) {
        where.level = filters.level as SeedLevel;
      }
      if (filters.status) {
        where.status = filters.status as LotStatus;
      }
      if (filters.varietyId) {
        where.varietyId = filters.varietyId;
      }
      if (filters.multiplierId) {
        where.multiplierId = filters.multiplierId;
      }

      // Filtres de date
      if (filters.startDate || filters.endDate) {
        where.productionDate = {};
        if (filters.startDate) {
          where.productionDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.productionDate.lte = new Date(filters.endDate);
        }
      }

      // 3. Options de tri
      const orderBy: any = {};
      const sortBy = filters.sortBy || "createdAt";
      const sortOrder = filters.sortOrder || "desc";
      orderBy[sortBy] = sortOrder;

      // 4. Tentative de récupération depuis le cache
      const cacheKey = `seedlots:${JSON.stringify({
        where,
        skip,
        pageSize,
        orderBy,
      })}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        logger.info("Returning cached seed lots");
        return cached;
      }

      // 5. Requêtes à la base de données
      const [seedLots, totalCount] = await Promise.all([
        prisma.seedLot.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: filters.includeRelations
            ? {
                variety: true,
                multiplier: true,
                parcel: true,
                parentLot: {
                  include: { variety: true },
                },
                childLots: {
                  include: { variety: true },
                },
                qualityControls: {
                  orderBy: { controlDate: "desc" },
                  take: 1,
                },
                productions: {
                  orderBy: { startDate: "desc" },
                  take: 1,
                },
                _count: {
                  select: {
                    childLots: true,
                    qualityControls: true,
                    productions: true,
                  },
                },
              }
            : {
                variety: true,
                multiplier: true,
                _count: {
                  select: { childLots: true },
                },
              },
        }),
        prisma.seedLot.count({ where }),
      ]);

      // 6. Calcul des métadonnées
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const result = {
        success: true,
        message: "Lots récupérés avec succès",
        data: seedLots,
        meta: {
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };

      // 7. Mise en cache
      await CacheService.set(cacheKey, result, 300); // Cache 5 minutes

      return result;
    } catch (error) {
      logger.error("Error fetching seed lots", { error, filters });
      throw error;
    }
  }

  /**
   * READ - Récupérer un lot spécifique par son ID
   */
  static async getSeedLotById(id: string, includeFullDetails = true) {
    try {
      // 1. Vérifier le cache
      const cacheKey = `seedlot:${id}:${includeFullDetails}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // 2. Récupérer depuis la base de données
      const seedLot = await prisma.seedLot.findUnique({
        where: { id, isActive: true },
        include: includeFullDetails
          ? {
              variety: {
                include: {
                  _count: {
                    select: { seedLots: true },
                  },
                },
              },
              multiplier: {
                include: {
                  _count: {
                    select: {
                      seedLots: true,
                      productions: true,
                    },
                  },
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
              parentLot: {
                include: {
                  variety: true,
                  multiplier: true,
                },
              },
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
                  inspector: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
                orderBy: { controlDate: "desc" },
              },
              productions: {
                include: {
                  activities: {
                    orderBy: { activityDate: "desc" },
                    take: 5,
                  },
                  issues: {
                    where: { resolved: false },
                  },
                  _count: {
                    select: {
                      activities: true,
                      issues: true,
                    },
                  },
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

      // 3. Enrichir avec des statistiques
      const stats = includeFullDetails
        ? await this.calculateLotStatistics(seedLot)
        : null;

      const result = {
        ...seedLot,
        statistics: stats,
      };

      // 4. Mettre en cache
      await CacheService.set(cacheKey, result, 600); // Cache 10 minutes

      return result;
    } catch (error) {
      logger.error("Error fetching seed lot by id", { error, id });
      throw error;
    }
  }

  /**
   * UPDATE - Mettre à jour un lot de semences
   */
  static async updateSeedLot(id: string, data: UpdateSeedLotData) {
    try {
      logger.info("Updating seed lot", { id, data });

      // 1. Vérifier l'existence du lot
      const existingLot = await prisma.seedLot.findUnique({
        where: { id, isActive: true },
        include: {
          variety: true,
          _count: {
            select: { childLots: true },
          },
        },
      });

      if (!existingLot) {
        throw new Error(`Lot non trouvé ou inactif: ${id}`);
      }

      // 2. Validation des changements
      if (data.quantity !== undefined && data.quantity < 0) {
        throw new Error("La quantité ne peut pas être négative");
      }

      // Vérifier que la nouvelle quantité n'est pas inférieure à la somme des lots enfants
      if (data.quantity !== undefined && existingLot._count.childLots > 0) {
        const childLotsTotal = await prisma.seedLot.aggregate({
          where: { parentLotId: id, isActive: true },
          _sum: { quantity: true },
        });

        if (
          childLotsTotal._sum.quantity &&
          data.quantity < childLotsTotal._sum.quantity
        ) {
          throw new Error(
            `La quantité ne peut pas être inférieure à la somme des lots enfants (${childLotsTotal._sum.quantity}kg)`
          );
        }
      }

      // 3. Construire l'objet de mise à jour
      const updateData: Prisma.SeedLotUpdateInput = {
        updatedAt: new Date(),
      };

      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.batchNumber !== undefined)
        updateData.batchNumber = data.batchNumber;

      if (data.status !== undefined) {
        updateData.status = data.status as LotStatus;

        // Si le lot est certifié, vérifier qu'il a passé au moins un contrôle qualité
        if (data.status === "CERTIFIED") {
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

      // 4. Effectuer la mise à jour
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

      // 5. Invalider le cache
      await CacheService.invalidate(`seedlot:${id}:*`);
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      // 6. Notifications
      if (data.status === "REJECTED") {
        await NotificationService.notifyLotRejected(updatedLot);
      } else if (data.status === "CERTIFIED") {
        await NotificationService.notifyLotCertified(updatedLot);
      }

      // Vérifier si le lot approche de l'expiration
      if (updatedLot.expiryDate) {
        const daysUntilExpiry = Math.floor(
          (updatedLot.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          await NotificationService.notifyLotExpiringSoon(
            updatedLot,
            daysUntilExpiry
          );
        }
      }

      logger.info(`Seed lot updated successfully: ${id}`);
      return updatedLot;
    } catch (error) {
      logger.error("Error updating seed lot", { error, id, data });
      throw error;
    }
  }

  /**
   * DELETE - Supprimer un lot de semences (soft delete)
   */
  static async deleteSeedLot(id: string, hardDelete = false) {
    try {
      logger.info(`${hardDelete ? "Hard" : "Soft"} deleting seed lot: ${id}`);

      // 1. Vérifier l'existence et les dépendances
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
        throw new Error(`Lot non trouvé: ${id}`);
      }

      // 2. Vérifier les dépendances
      if (seedLot._count.childLots > 0) {
        throw new Error(
          `Impossible de supprimer le lot ${id}: il a ${seedLot._count.childLots} lots enfants`
        );
      }

      if (seedLot._count.productions > 0 && hardDelete) {
        throw new Error(
          `Impossible de supprimer définitivement le lot ${id}: il a ${seedLot._count.productions} productions associées`
        );
      }

      // 3. Effectuer la suppression
      if (hardDelete && process.env.NODE_ENV === "production") {
        throw new Error(
          "La suppression définitive n'est pas autorisée en production"
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        if (hardDelete) {
          // Supprimer d'abord les relations
          await tx.qualityControl.deleteMany({ where: { lotId: id } });
          await tx.production.deleteMany({ where: { lotId: id } });

          // Puis supprimer le lot
          return await tx.seedLot.delete({ where: { id } });
        } else {
          // Soft delete
          return await tx.seedLot.update({
            where: { id },
            data: { isActive: false },
          });
        }
      });

      // 4. Invalider le cache
      await CacheService.invalidate(`seedlot:${id}:*`);
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      // 5. Log d'audit
      logger.audit("Seed lot deleted", {
        lotId: id,
        hardDelete,
        deletedBy: "system", // À remplacer par l'utilisateur actuel
      });

      logger.info(`Seed lot deleted successfully: ${id}`);
      return { success: true, message: `Lot ${id} supprimé avec succès` };
    } catch (error) {
      logger.error("Error deleting seed lot", { error, id });
      throw error;
    }
  }

  /**
   * Méthodes utilitaires supplémentaires
   */

  // Recherche avancée avec filtres complexes
  static async searchSeedLots(searchCriteria: {
    query?: string;
    filters?: Record<string, any>;
    dateRange?: { start: Date; end: Date };
    includeExpired?: boolean;
    includeInactive?: boolean;
  }) {
    try {
      const where: Prisma.SeedLotWhereInput = {
        isActive: searchCriteria.includeInactive ? undefined : true,
      };

      // Recherche textuelle globale
      if (searchCriteria.query) {
        where.OR = [
          { id: { contains: searchCriteria.query, mode: "insensitive" } },
          { notes: { contains: searchCriteria.query, mode: "insensitive" } },
          {
            batchNumber: {
              contains: searchCriteria.query,
              mode: "insensitive",
            },
          },
          {
            variety: {
              name: { contains: searchCriteria.query, mode: "insensitive" },
            },
          },
          {
            variety: {
              code: { contains: searchCriteria.query, mode: "insensitive" },
            },
          },
          {
            multiplier: {
              name: { contains: searchCriteria.query, mode: "insensitive" },
            },
          },
        ];
      }

      // Filtres personnalisés
      if (searchCriteria.filters) {
        Object.assign(where, searchCriteria.filters);
      }

      // Filtre de date
      if (searchCriteria.dateRange) {
        where.productionDate = {
          gte: searchCriteria.dateRange.start,
          lte: searchCriteria.dateRange.end,
        };
      }

      // Filtre d'expiration
      if (!searchCriteria.includeExpired) {
        where.OR = [{ expiryDate: null }, { expiryDate: { gt: new Date() } }];
      }

      const results = await prisma.seedLot.findMany({
        where,
        include: {
          variety: true,
          multiplier: true,
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100, // Limite de sécurité
      });

      return results;
    } catch (error) {
      logger.error("Error searching seed lots", { error, searchCriteria });
      throw error;
    }
  }

  // Opérations en masse
  static async bulkUpdateSeedLots(
    ids: string[],
    updateData: Partial<UpdateSeedLotData>
  ) {
    try {
      logger.info(`Bulk updating ${ids.length} seed lots`);

      // Validation
      if (ids.length === 0) {
        throw new Error("Aucun lot à mettre à jour");
      }

      if (ids.length > 100) {
        throw new Error("Maximum 100 lots peuvent être mis à jour en une fois");
      }

      // Effectuer la mise à jour
      const result = await prisma.seedLot.updateMany({
        where: {
          id: { in: ids },
          isActive: true,
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Invalider le cache
      await CacheService.invalidate("seedlots:*");
      for (const id of ids) {
        await CacheService.invalidate(`seedlot:${id}:*`);
      }

      logger.info(`Bulk update completed: ${result.count} lots updated`);
      return {
        success: true,
        count: result.count,
        message: `${result.count} lots mis à jour avec succès`,
      };
    } catch (error) {
      logger.error("Error in bulk update", { error, ids });
      throw error;
    }
  }

  // Export des données
  static async exportSeedLots(
    filters: SeedLotFilters,
    format: "csv" | "json" | "xlsx" = "csv"
  ) {
    try {
      // Récupérer tous les lots sans pagination
      const allLots = await prisma.seedLot.findMany({
        where: this.buildWhereClause(filters),
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
        orderBy: { productionDate: "desc" },
      });

      // Formater selon le format demandé
      switch (format) {
        case "csv":
          return this.formatAsCSV(allLots);
        case "json":
          return JSON.stringify(allLots, null, 2);
        case "xlsx":
          return this.formatAsExcel(allLots);
        default:
          throw new Error(`Format d'export non supporté: ${format}`);
      }
    } catch (error) {
      logger.error("Error exporting seed lots", { error, filters });
      throw error;
    }
  }

  // Méthodes privées d'aide
  private static buildWhereClause(
    filters: SeedLotFilters
  ): Prisma.SeedLotWhereInput {
    const where: Prisma.SeedLotWhereInput = { isActive: true };

    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: "insensitive" } },
        {
          variety: { name: { contains: filters.search, mode: "insensitive" } },
        },
        {
          variety: { code: { contains: filters.search, mode: "insensitive" } },
        },
      ];
    }

    if (filters.level) where.level = filters.level as SeedLevel;
    if (filters.status) where.status = filters.status as LotStatus;
    if (filters.varietyId) where.varietyId = filters.varietyId;
    if (filters.multiplierId) where.multiplierId = filters.multiplierId;

    return where;
  }

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

    // Calcul du taux de germination moyen
    if (lot.qualityControls && lot.qualityControls.length > 0) {
      const totalGermination = lot.qualityControls.reduce(
        (sum: number, qc: any) => sum + qc.germinationRate,
        0
      );
      stats.averageGerminationRate =
        totalGermination / lot.qualityControls.length;
      stats.lastControlDate = lot.qualityControls[0].controlDate;
    }

    // Calcul des jours jusqu'à l'expiration
    if (lot.expiryDate) {
      stats.daysUntilExpiry = Math.floor(
        (new Date(lot.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
    }

    // Quantité totale dans les lots enfants
    if (lot.childLots) {
      stats.totalQuantityInChildren = lot.childLots.reduce(
        (sum: number, child: any) => sum + child.quantity,
        0
      );
    }

    return stats;
  }

  private static formatAsCSV(lots: any[]): string {
    const headers = [
      "ID",
      "Variété",
      "Code Variété",
      "Niveau",
      "Quantité (kg)",
      "Date Production",
      "Date Expiration",
      "Statut",
      "Multiplicateur",
      "Parcelle",
      "Dernier Taux Germination (%)",
      "Notes",
    ];

    const rows = lots.map((lot) => {
      const lastQC = lot.qualityControls?.[0];
      return [
        lot.id,
        lot.variety.name,
        lot.variety.code,
        lot.level,
        lot.quantity,
        new Date(lot.productionDate).toLocaleDateString("fr-FR"),
        lot.expiryDate
          ? new Date(lot.expiryDate).toLocaleDateString("fr-FR")
          : "",
        lot.status,
        lot.multiplier?.name || "",
        lot.parcel?.name || "",
        lastQC?.germinationRate || "",
        `"${(lot.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  private static formatAsExcel(lots: any[]): any {
    // Cette méthode nécessiterait une bibliothèque comme xlsx
    // Pour l'instant, on retourne le format CSV
    logger.warn("Excel format not implemented, returning CSV");
    return this.formatAsCSV(lots);
  }
}
