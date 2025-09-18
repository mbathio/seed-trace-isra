// backend/src/services/SeedLotService.ts - VERSION CORRIGÉE COMPLÈTE

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
import DataTransformer from "../utils/transformers";

const prisma = new PrismaClient();

// ✅ CORRECTION: Types d'interface mis à jour
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
   * ✅ CORRECTION: CREATE - Créer un nouveau lot de semences
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

      // ✅ CORRECTION: Transformer les valeurs UI vers DB avant l'insertion
      const dbLevel = data.level as SeedLevel; // Les niveaux sont identiques
      const dbStatus = data.status
        ? (DataTransformer.transformLotStatusUIToDB(data.status) as LotStatus)
        : LotStatus.PENDING;

      // 6. Créer le lot dans une transaction
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const seedLot = await tx.seedLot.create({
            data: {
              id: lotId,
              variety: { connect: { id: data.varietyId } },
              level: dbLevel,
              quantity: data.quantity,
              productionDate: new Date(data.productionDate),
              expiryDate,
              status: dbStatus,
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

      // ✅ CORRECTION: Transformer le résultat pour le frontend
      const transformedResult = DataTransformer.transformSeedLot(result);

      // 7. Invalider le cache et notifications
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      if (data.parentLotId) {
        await NotificationService.notifyLotCreatedFromParent(
          transformedResult,
          data.parentLotId
        );
      }

      logger.info(`Seed lot created successfully: ${transformedResult.id}`);
      return transformedResult;
    } catch (error) {
      logger.error("Error creating seed lot", { error, data });
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: READ - Récupérer la liste des lots avec transformation
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

      // ✅ CORRECTION CRITIQUE: Construction WHERE robuste
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

      // ✅ CORRECTION CRITIQUE: Filtres avec validation stricte
      if (filters.level && filters.level.trim()) {
        // Le middleware a déjà transformé UI → DB, mais s'assurer que c'est valide
        const validLevels = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
        const levelUpper = filters.level.toUpperCase();
        if (validLevels.includes(levelUpper)) {
          where.level = levelUpper as SeedLevel;
          console.log("✅ [SERVICE] Applied level filter:", where.level);
        } else {
          console.warn("❌ [SERVICE] Invalid level filter:", filters.level);
        }
      }

      if (filters.status && filters.status.trim()) {
        // ✅ CORRECTION: Le middleware a transformé UI → DB (ex: "certified" → "CERTIFIED")
        // On doit utiliser la valeur déjà transformée
        const validStatuses = [
          "PENDING",
          "CERTIFIED",
          "REJECTED",
          "IN_STOCK",
          "SOLD",
          "ACTIVE",
          "DISTRIBUTED",
        ];
        if (validStatuses.includes(filters.status)) {
          where.status = filters.status as LotStatus;
          console.log("✅ [SERVICE] Applied status filter:", where.status);
        } else {
          console.warn("❌ [SERVICE] Invalid status filter:", filters.status);
          // Le filtre a peut-être déjà été transformé, essayons les valeurs UI aussi
          const uiToDbMapping: Record<string, LotStatus> = {
            pending: "PENDING",
            certified: "CERTIFIED",
            rejected: "REJECTED",
            "in-stock": "IN_STOCK",
            sold: "SOLD",
            active: "ACTIVE",
            distributed: "DISTRIBUTED",
          };

          const dbStatus = uiToDbMapping[filters.status];
          if (dbStatus) {
            where.status = dbStatus;
            console.log(
              "✅ [SERVICE] Applied transformed status filter:",
              where.status
            );
          }
        }
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

      // 2. Options de tri
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

      console.log(
        "🔍 [SERVICE] Final WHERE clause:",
        JSON.stringify(where, null, 2)
      );
      console.log("🔍 [SERVICE] Order by:", orderBy);

      // 3. Relations à inclure
      const includeRelations = filters.includeRelations !== false;
      // Always include childLots for availableQuantity calculation
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

      // 4. Exécuter les requêtes
      console.log("🚀 [SERVICE] Executing Prisma queries...");

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

      console.log(
        `✅ [SERVICE] Query executed successfully: ${seedLots.length}/${totalCount} results`
      );

      // ✅ CORRECTION: Transformer chaque lot pour le frontend (DB → UI)
      const transformedLots = seedLots.map((lot) => {
        const transformed = DataTransformer.transformSeedLot(lot);

        // Ajouter la quantité disponible calculée
        const childLotsQuantity =
          lot.childLots?.reduce(
            (sum: number, child: any) => sum + child.quantity,
            0
          ) || 0;

        return {
          ...transformed,
          availableQuantity: lot.quantity - childLotsQuantity,
        };
      });

      // 5. Métadonnées de pagination
      const totalPages = Math.ceil(totalCount / pageSize);

      const result: GetSeedLotsResult = {
        success: true,
        message: `${transformedLots.length} lots récupérés avec succès`,
        data: transformedLots,
        meta: {
          totalCount,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };

      console.log("✅ [SERVICE] Final result prepared:", {
        dataCount: result.data.length,
        totalCount: result.meta.totalCount,
        currentPage: result.meta.page,
        totalPages: result.meta.totalPages,
      });

      return result;
    } catch (error) {
      console.error("❌ [SERVICE] Error fetching seed lots:", error);
      logger.error("Error fetching seed lots", { error, filters });

      // Retourner un résultat d'erreur structuré
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
   * ✅ CORRECTION: READ - Récupérer un lot par ID avec transformation
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

      // ✅ CORRECTION: Transformer le résultat complet
      const transformedLot = DataTransformer.transformSeedLot(seedLot);

      // Ajouter des statistiques si détails complets
      const stats = includeFullDetails
        ? await this.calculateLotStatistics(seedLot)
        : null;

      const result = {
        ...transformedLot,
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
   * ✅ CORRECTION: UPDATE - Mettre à jour avec transformation
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

      // Validation des changements
      if (data.quantity !== undefined && data.quantity < 0) {
        throw new Error("La quantité ne peut pas être négative");
      }

      // ✅ CORRECTION: Construire l'objet de mise à jour avec transformation
      const updateData: any = { updatedAt: new Date() };

      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.batchNumber !== undefined)
        updateData.batchNumber = data.batchNumber;

      // ✅ CORRECTION: Transformer le statut UI vers DB
      if (data.status !== undefined) {
        updateData.status = DataTransformer.transformLotStatusUIToDB(
          data.status
        );

        // Validation pour certification
        if (data.status === "certified") {
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

      // ✅ CORRECTION: Transformer le résultat
      const transformedResult = DataTransformer.transformSeedLot(updatedLot);

      // Invalider le cache et notifications
      await CacheService.invalidate(`seedlot:${id}:*`);
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      // Notifications
      if (data.status === "rejected") {
        await NotificationService.notifyLotRejected(transformedResult);
      } else if (data.status === "certified") {
        await NotificationService.notifyLotCertified(transformedResult);
      }

      logger.info(`Seed lot updated successfully: ${id}`);
      return transformedResult;
    } catch (error) {
      logger.error("Error updating seed lot", { error, id, data });
      throw error;
    }
  }
  // À ajouter dans backend/src/services/SeedLotService.ts

  /**
   * GET - Récupérer les statistiques d'un lot
   */
  static async getSeedLotStats(lotId: string): Promise<any> {
    try {
      logger.info(`Getting stats for seed lot: ${lotId}`);

      // Vérifier l'existence du lot
      const seedLot = await prisma.seedLot.findUnique({
        where: { id: lotId, isActive: true },
        include: {
          variety: true,
          multiplier: true,
          childLots: {
            where: { isActive: true },
            select: {
              id: true,
              quantity: true,
              level: true,
              status: true,
            },
          },
          qualityControls: {
            orderBy: { controlDate: "desc" },
            select: {
              id: true,
              result: true,
              germinationRate: true,
              varietyPurity: true,
              controlDate: true,
            },
          },
          productions: {
            select: {
              id: true,
              status: true,
              actualYield: true,
              startDate: true,
            },
          },
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
        throw new Error(`Lot non trouvé: ${lotId}`);
      }

      // Calculer les statistiques
      const stats = {
        // Informations de base
        lotId: seedLot.id,
        varietyName: seedLot.variety.name,
        level: seedLot.level,
        totalQuantity: seedLot.quantity,

        // Statistiques des lots enfants
        totalChildLots: seedLot._count.childLots,
        quantityInChildren: seedLot.childLots.reduce(
          (sum: number, child: any) => sum + child.quantity,
          0
        ),
        availableQuantity:
          seedLot.quantity -
          seedLot.childLots.reduce(
            (sum: number, child: any) => sum + child.quantity,
            0
          ),

        // Statistiques par niveau des enfants
        childLotsByLevel: seedLot.childLots.reduce((acc: any, child: any) => {
          acc[child.level] = (acc[child.level] || 0) + 1;
          return acc;
        }, {}),

        // Statistiques de qualité
        totalQualityControls: seedLot._count.qualityControls,
        passedQualityControls: seedLot.qualityControls.filter(
          (qc: any) => qc.result === "PASS"
        ).length,
        failedQualityControls: seedLot.qualityControls.filter(
          (qc: any) => qc.result === "FAIL"
        ).length,

        // Dernier contrôle qualité
        lastQualityControl: seedLot.qualityControls[0] || null,
        qualityStatus:
          seedLot.qualityControls.length > 0
            ? seedLot.qualityControls[0].result
            : "Non testé",

        // Moyennes de qualité
        averageGerminationRate:
          seedLot.qualityControls.length > 0
            ? seedLot.qualityControls.reduce(
                (sum: number, qc: any) => sum + (qc.germinationRate || 0),
                0
              ) / seedLot.qualityControls.length
            : null,

        averageVarietyPurity:
          seedLot.qualityControls.length > 0
            ? seedLot.qualityControls.reduce(
                (sum: number, qc: any) => sum + (qc.varietyPurity || 0),
                0
              ) / seedLot.qualityControls.length
            : null,

        // Statistiques de production
        totalProductions: seedLot._count.productions,
        completedProductions: seedLot.productions.filter(
          (p: any) => p.status === "COMPLETED"
        ).length,
        inProgressProductions: seedLot.productions.filter(
          (p: any) => p.status === "IN_PROGRESS"
        ).length,

        // Rendement moyen
        averageYield:
          seedLot.productions.length > 0
            ? seedLot.productions
                .filter((p: any) => p.actualYield)
                .reduce(
                  (sum: number, p: any) => sum + (p.actualYield || 0),
                  0
                ) / seedLot.productions.filter((p: any) => p.actualYield).length
            : null,

        // Taux d'utilisation
        utilizationRate:
          seedLot.quantity > 0
            ? ((seedLot.quantity -
                (seedLot.quantity -
                  seedLot.childLots.reduce(
                    (sum: number, child: any) => sum + child.quantity,
                    0
                  ))) /
                seedLot.quantity) *
              100
            : 0,

        // Informations sur l'âge du lot
        ageInDays: Math.floor(
          (Date.now() - new Date(seedLot.productionDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),

        // Statut d'expiration
        isExpired: seedLot.expiryDate
          ? new Date(seedLot.expiryDate) < new Date()
          : false,
        daysUntilExpiry: seedLot.expiryDate
          ? Math.floor(
              (new Date(seedLot.expiryDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
          : null,

        // Multiplicateur
        multiplierName: seedLot.multiplier?.name || "ISRA",

        // Timestamps
        createdAt: seedLot.createdAt,
        updatedAt: seedLot.updatedAt,
      };

      logger.info(`Statistics calculated for lot ${lotId}:`, {
        totalControls: stats.totalQualityControls,
        childLots: stats.totalChildLots,
        productions: stats.totalProductions,
      });

      return stats;
    } catch (error) {
      logger.error("Error getting seed lot statistics:", { error, lotId });
      throw error;
    }
  }
  // Ajouter ces méthodes dans backend/src/services/SeedLotService.ts

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

      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
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
        }
      );

      // 4. Invalider le cache
      await CacheService.invalidate(`seedlot:${id}:*`);
      await CacheService.invalidate("seedlots:*");
      await CacheService.invalidate("stats:*");

      logger.info(`Seed lot deleted successfully: ${id}`);
      return { success: true, message: `Lot ${id} supprimé avec succès` };
    } catch (error) {
      logger.error("Error deleting seed lot", { error, id });
      throw error;
    }
  }

  /**
   * Recherche avancée avec filtres complexes
   */
  static async searchSeedLots(searchCriteria: {
    query?: string;
    filters?: Record<string, any>;
    dateRange?: { start: Date; end: Date };
    includeExpired?: boolean;
    includeInactive?: boolean;
  }) {
    try {
      const where: any = {
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

  /**
   * Récupérer l'historique des modifications d'un lot
   */
  static async getSeedLotHistory(lotId: string): Promise<any[]> {
    try {
      // Pour l'instant, retourner un historique basique
      // Dans une vraie implémentation, vous devriez avoir une table d'audit
      const lot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: {
          qualityControls: {
            orderBy: { controlDate: "desc" },
          },
          productions: {
            orderBy: { startDate: "desc" },
          },
        },
      });

      if (!lot) {
        throw new Error("Lot non trouvé");
      }

      const history = [
        {
          date: lot.createdAt,
          action: "Création du lot",
          details: { quantity: lot.quantity, status: lot.status },
        },
        ...lot.qualityControls.map((qc: any) => ({
          date: qc.controlDate,
          action: "Contrôle qualité",
          details: { result: qc.result, germination: qc.germinationRate },
        })),
        ...lot.productions.map((prod: any) => ({
          date: prod.startDate,
          action: "Début de production",
          details: { status: prod.status },
        })),
      ];

      return history.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      logger.error("Error getting seed lot history", error);
      throw error;
    }
  }

  /**
   * Valider un lot de semences
   */
  static async validateSeedLot(lotId: string): Promise<any> {
    try {
      const lot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: {
          variety: true,
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
      });

      if (!lot) {
        throw new Error("Lot non trouvé");
      }

      const errors: string[] = [];

      // Validations
      if (lot.quantity <= 0) {
        errors.push("La quantité doit être positive");
      }

      if (lot.expiryDate && new Date() > lot.expiryDate) {
        errors.push("Le lot est expiré");
      }

      if (lot.status === "CERTIFIED" && lot.qualityControls.length === 0) {
        errors.push("Un lot certifié doit avoir au moins un contrôle qualité");
      }

      if (
        lot.qualityControls.length > 0 &&
        lot.qualityControls[0].result === "FAIL"
      ) {
        errors.push("Le dernier contrôle qualité a échoué");
      }

      return {
        isValid: errors.length === 0,
        errors,
        lot,
      };
    } catch (error) {
      logger.error("Error validating seed lot", error);
      throw error;
    }
  }
  /**
   * ✅ CORRECTION: Autres méthodes avec corrections similaires
   */

  // Méthode pour récupérer l'arbre généalogique
  static async getGenealogyTree(
    lotId: string,
    maxDepth: number = 10
  ): Promise<any> {
    try {
      return await GenealogyService.getGenealogyTree(lotId, maxDepth);
    } catch (error) {
      logger.error("Error getting genealogy tree", error);
      throw error;
    }
  }

  static async createChildLot(parentId: string, data: any): Promise<any> {
    try {
      const parentLot = await prisma.seedLot.findUnique({
        where: { id: parentId },
        include: { variety: true },
      });

      if (!parentLot) {
        throw new Error("Lot parent non trouvé");
      }

      if (data.quantity > parentLot.quantity) {
        throw new Error("Quantité insuffisante dans le lot parent");
      }

      const childLot = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const newLot = await tx.seedLot.create({
            data: {
              ...data,
              parentLotId: parentId,
              varietyId: parentLot.varietyId,
              id: await generateLotId(data.level, parentLot.variety.code),
            },
            include: { variety: true, multiplier: true },
          });

          await tx.seedLot.update({
            where: { id: parentId },
            data: { quantity: { decrement: data.quantity } },
          });

          return newLot;
        }
      );

      // ✅ CORRECTION: Transformer le résultat
      return DataTransformer.transformSeedLot(childLot);
    } catch (error) {
      logger.error("Error creating child lot", error);
      throw error;
    }
  }

  static async transferLot(
    lotId: string,
    targetMultiplierId: number,
    quantity: number,
    notes?: string
  ): Promise<any> {
    try {
      const sourceLot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: { variety: true },
      });

      if (!sourceLot) {
        throw new Error("Lot source non trouvé");
      }

      if (quantity > sourceLot.quantity) {
        throw new Error("Quantité insuffisante");
      }

      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const transferredLot = await tx.seedLot.create({
            data: {
              varietyId: sourceLot.varietyId,
              level: sourceLot.level,
              quantity,
              productionDate: sourceLot.productionDate,
              expiryDate: sourceLot.expiryDate,
              multiplierId: targetMultiplierId,
              parentLotId: lotId,
              notes: notes || `Transféré depuis ${lotId}`,
              status: sourceLot.status,
              id: await generateLotId(sourceLot.level, sourceLot.variety.code),
            },
          });

          await tx.seedLot.update({
            where: { id: lotId },
            data: { quantity: { decrement: quantity } },
          });

          return { sourceLot: lotId, transferredLot, quantity };
        }
      );

      return result;
    } catch (error) {
      logger.error("Error transferring lot", error);
      throw error;
    }
  }

  // Autres méthodes utilitaires...
  static async bulkUpdateSeedLots(
    ids: string[],
    updateData: Partial<UpdateSeedLotData>
  ) {
    try {
      logger.info(`Bulk updating ${ids.length} seed lots`);

      if (ids.length === 0) {
        throw new Error("Aucun lot à mettre à jour");
      }

      if (ids.length > 100) {
        throw new Error("Maximum 100 lots peuvent être mis à jour en une fois");
      }

      const dataToUpdate: any = { updatedAt: new Date() };

      if (updateData.quantity !== undefined)
        dataToUpdate.quantity = updateData.quantity;
      if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
      if (updateData.batchNumber !== undefined)
        dataToUpdate.batchNumber = updateData.batchNumber;

      // ✅ CORRECTION: Transformer le statut
      if (updateData.status !== undefined) {
        dataToUpdate.status = DataTransformer.transformLotStatusUIToDB(
          updateData.status
        );
      }

      if (updateData.expiryDate !== undefined) {
        dataToUpdate.expiryDate = updateData.expiryDate
          ? new Date(updateData.expiryDate)
          : null;
      }

      const result = await prisma.seedLot.updateMany({
        where: { id: { in: ids }, isActive: true },
        data: dataToUpdate,
      });

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

  // Autres méthodes avec transformations similaires...
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

  // Export et autres méthodes utilitaires...
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

      switch (format) {
        case "csv":
          return this.formatAsCSV(allLots);
        case "json":
          return JSON.stringify(
            allLots.map((lot) => DataTransformer.transformSeedLot(lot)),
            null,
            2
          );
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

  private static buildWhereClause(filters: SeedLotFilters): any {
    const where: any = { isActive: true };

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

    if (filters.level) where.level = filters.level;
    if (filters.status) {
      where.status = DataTransformer.transformLotStatusUIToDB(filters.status);
    }
    if (filters.varietyId) where.varietyId = filters.varietyId;
    if (filters.multiplierId) where.multiplierId = filters.multiplierId;

    return where;
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
      const transformedLot = DataTransformer.transformSeedLot(lot);

      return [
        transformedLot.id,
        transformedLot.varietyName,
        transformedLot.varietyCode,
        transformedLot.level,
        transformedLot.quantity,
        new Date(transformedLot.productionDate).toLocaleDateString("fr-FR"),
        transformedLot.expiryDate
          ? new Date(transformedLot.expiryDate).toLocaleDateString("fr-FR")
          : "",
        transformedLot.status,
        transformedLot.multiplierName || "",
        transformedLot.parcelName || "",
        lastQC?.germinationRate || "",
        `"${(transformedLot.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  private static formatAsExcel(lots: any[]): any {
    logger.warn("Excel format not implemented, returning CSV");
    return this.formatAsCSV(lots);
  }
}
