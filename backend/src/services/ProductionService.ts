// backend/src/services/ProductionService.ts
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import {
  ProductionStatus,
  SeedLevel,
  LotStatus,
  ParcelStatus,
} from "@prisma/client";
import { SeedLotService } from "./SeedLotService"; // 🆕 pour créer le lot automatiquement
import { getNextLevel } from "../utils/seedLotHelpers"; // 🆕 pour calculer le niveau enfant
import { generateChildLotId } from "../utils/seedLotHelpers";

const SEED_LEVEL_ORDER: SeedLevel[] = [
  "GO",
  "G1",
  "G2",
  "G3",
  "G4",
  "R1",
  "R2",
];

function getNextSeedLevel(current: SeedLevel | null | undefined): SeedLevel {
  if (!current) {
    return "GO";
  }
  const idx = SEED_LEVEL_ORDER.indexOf(current);
  if (idx === -1 || idx === SEED_LEVEL_ORDER.length - 1) {
    // Si on ne trouve pas ou déjà au dernier niveau, on garde le niveau actuel
    return current;
  }
  return SEED_LEVEL_ORDER[idx + 1];
}

export class ProductionService {
  static async createProduction(data: any): Promise<any> {
    try {
      const createData: any = {
        lotId: data.lotId,
        multiplierId: data.multiplierId,
        parcelId: data.parcelId,
        startDate: new Date(data.startDate),
        status: data.status || ProductionStatus.PLANNED,
        plannedQuantity: data.plannedQuantity,
        notes: data.notes,
        weatherConditions: data.weatherConditions,
      };

      // Ajouter les dates optionnelles seulement si définies
      if (data.endDate) createData.endDate = new Date(data.endDate);
      if (data.sowingDate) createData.sowingDate = new Date(data.sowingDate);
      if (data.harvestDate) createData.harvestDate = new Date(data.harvestDate);
      if (data.actualYield !== undefined)
        createData.actualYield = data.actualYield;

      const production = await prisma.production.create({
        data: createData,
        include: {
          seedLot: {
            include: {
              variety: true,
            },
          },
          multiplier: true,
          parcel: true,
        },
      });

      return production;
    } catch (error) {
      logger.error("Erreur lors de la création de la production:", error);
      throw error;
    }
  }

  static async getProductions(
    query: PaginationQuery & any
  ): Promise<{ productions: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        status,
        multiplierId,
        sortBy = "startDate",
        sortOrder = "desc",
        parcelId,
      } = query;

      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (search) {
        where.OR = [
          { lotId: { contains: search, mode: "insensitive" } },
          { notes: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (multiplierId) {
        where.multiplierId = parseInt(multiplierId, 10);
      }

      if (parcelId) {
        where.parcelId = Number(parcelId);
      }

      const [productions, total] = await Promise.all([
        prisma.production.findMany({
          where,
          include: {
            seedLot: {
              include: {
                variety: true,
              },
            },
            multiplier: true,
            parcel: true,
            activities: {
              orderBy: { activityDate: "desc" },
              take: 3,
            },
            issues: {
              where: { resolved: false },
              take: 3,
            },
            _count: {
              select: {
                activities: true,
                issues: true,
                weatherData: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSize,
        }),
        prisma.production.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        productions,
        total,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des productions:", error);
      throw error;
    }
  }

  static async getProductionById(id: number): Promise<any> {
    try {
      const production = await prisma.production.findUnique({
        where: { id },
        include: {
          seedLot: {
            include: {
              variety: true,
            },
          },
          multiplier: true,
          parcel: {
            include: {
              soilAnalyses: {
                orderBy: { analysisDate: "desc" },
                take: 1,
              },
            },
          },
          activities: {
            include: {
              user: {
                select: { id: true, name: true },
              },
              inputs: true,
            },
            orderBy: { activityDate: "desc" },
          },
          issues: {
            orderBy: { issueDate: "desc" },
          },
          weatherData: {
            orderBy: { recordDate: "desc" },
          },
        },
      });

      return production;
    } catch (error) {
      logger.error("Erreur lors de la récupération de la production:", error);
      throw error;
    }
  }

  static async updateProduction(
    id: number,
    data: Partial<{
      status: ProductionStatus;
      startDate: Date | string | null;
      endDate: Date | string | null;
      sowingDate: Date | string | null;
      harvestDate: Date | string | null;
      plannedQuantity: number | null;
      actualYield: number | null;
      weatherConditions: string | null;
      notes: string | null;
      multiplierId: number | null;
      parcelId: number | null;
    }>
  ) {
    logger.info("]: Updating production |", { id, data });

    try {
      // 🔒 Transaction pour garder tout cohérent
      const updated = await prisma.$transaction(async (tx) => {
        const existing = await tx.production.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new Error("Production introuvable");
        }

        const previousStatus = existing.status as ProductionStatus | null;
        const nextStatus =
          (data.status as ProductionStatus | undefined) ?? previousStatus;

        const updateData: any = {};

        if (data.status !== undefined) updateData.status = data.status;

        if (data.startDate !== undefined)
          updateData.startDate = data.startDate
            ? new Date(data.startDate as any)
            : null;
        if (data.endDate !== undefined)
          updateData.endDate = data.endDate
            ? new Date(data.endDate as any)
            : null;
        if (data.sowingDate !== undefined)
          updateData.sowingDate = data.sowingDate
            ? new Date(data.sowingDate as any)
            : null;
        if (data.harvestDate !== undefined)
          updateData.harvestDate = data.harvestDate
            ? new Date(data.harvestDate as any)
            : null;

        if (data.plannedQuantity !== undefined)
          updateData.plannedQuantity = data.plannedQuantity;
        if (data.actualYield !== undefined)
          updateData.actualYield = data.actualYield;

        if (data.weatherConditions !== undefined)
          updateData.weatherConditions = data.weatherConditions;
        if (data.notes !== undefined) updateData.notes = data.notes;

        if (data.multiplierId !== undefined)
          updateData.multiplierId = data.multiplierId;
        if (data.parcelId !== undefined) updateData.parcelId = data.parcelId;

        const production = await tx.production.update({
          where: { id },
          data: updateData,
        });

        // ✅ Si le statut vient de passer à COMPLETED → création automatique du lot de semence
        if (previousStatus !== "COMPLETED" && nextStatus === "COMPLETED") {
          await ProductionService.createSeedLotFromCompletedProduction(
            tx,
            production
          );

          // ✅ Et on libère la parcelle (si elle existe)
          if (production.parcelId) {
            try {
              await tx.parcel.update({
                where: { id: production.parcelId },
                data: {
                  status: ParcelStatus.AVAILABLE, // "libre"
                  updatedAt: new Date(),
                },
              });

              logger.info("Parcelle libérée après fin de production", {
                parcelId: production.parcelId,
                productionId: production.id,
                newStatus: ParcelStatus.AVAILABLE,
              });
            } catch (err) {
              logger.error(
                "Erreur lors de la libération de la parcelle après fin de production",
                {
                  parcelId: production.parcelId,
                  productionId: production.id,
                  error: err,
                }
              );
              // On peut choisir de ne pas throw ici pour ne pas bloquer la mise à jour de la production,
              // mais perso je te conseille de laisser remonter l'erreur si c'est critique.
              throw err;
            }
          }
        }

        return production;
      });

      // On recharge la production complète (avec les compteurs) pour le front
      const full = await ProductionService.getProductionById(id);
      return full ?? updated;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la production:", error);
      throw error;
    }
  }

  private static async createSeedLotFromCompletedProduction(
    tx: any,
    production: any
  ) {
    try {
      if (!production.lotId) {
        logger.warn(
          "Production terminée sans lot source, aucun lot de semence créé",
          { productionId: production.id }
        );
        return;
      }

      const parentLot = await tx.seedLot.findUnique({
        where: { id: production.lotId },
      });

      if (!parentLot) {
        logger.warn("Lot parent introuvable pour la production terminée", {
          productionId: production.id,
          lotId: production.lotId,
        });
        return;
      }

      // Rendement = quantité du nouveau lot
      const quantity: number | null =
        production.actualYield ?? production.plannedQuantity ?? null;

      if (!quantity || quantity <= 0) {
        logger.warn(
          "Impossible de créer un lot de semence: rendement nul ou manquant",
          {
            productionId: production.id,
            actualYield: production.actualYield,
            plannedQuantity: production.plannedQuantity,
          }
        );
        return;
      }

      const nextLevel = getNextSeedLevel(parentLot.level as SeedLevel | null);
      const productionDate: Date =
        production.harvestDate ||
        production.endDate ||
        production.startDate ||
        new Date();
      // Générer un ID enfant basé sur le lot parent
      const newLotId = generateChildLotId(
        parentLot.id,
        nextLevel,
        productionDate
      );

      const newLot = await tx.seedLot.create({
        data: {
          id: newLotId, // ← OBLIGATOIRE pour Prisma
          varietyId: parentLot.varietyId,
          level: nextLevel,
          quantity,
          productionDate,
          expiryDate: parentLot.expiryDate ?? null,
          status: LotStatus.IN_STOCK,
          multiplierId:
            production.multiplierId ?? parentLot.multiplierId ?? null,
          parcelId: production.parcelId ?? parentLot.parcelId ?? null,
          parentLotId: parentLot.id,
          batchNumber: parentLot.batchNumber,
          notes: `Lot créé automatiquement à partir de la production ${production.id}`,
        },
      });

      // 🔄 On marque le lot parent comme "en utilisation"
      await tx.seedLot.update({
        where: { id: parentLot.id },
        data: {
          status: LotStatus.ACTIVE,
        },
      });

      logger.info(
        "Lot de semence créé automatiquement à partir d'une production terminée",
        {
          productionId: production.id,
          parentLotId: parentLot.id,
          newLotId: newLot.id,
          quantity,
          level: nextLevel,
        }
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la création automatique du lot de semence à partir de la production:",
        { productionId: production.id, error }
      );
      throw error;
    }
  }

  static async deleteProduction(id: number): Promise<void> {
    try {
      await prisma.production.delete({
        where: { id },
      });
    } catch (error) {
      logger.error("Erreur lors de la suppression de la production:", error);
      throw error;
    }
  }

  static async addActivity(productionId: number, data: any): Promise<any> {
    try {
      const activity = await prisma.productionActivity.create({
        data: {
          productionId,
          type: data.type,
          activityDate: new Date(data.activityDate),
          description: data.description,
          personnel: data.personnel || [],
          notes: data.notes,
          userId: data.userId,
          inputs: {
            create: data.inputs || [],
          },
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
          inputs: true,
        },
      });

      return activity;
    } catch (error) {
      logger.error("Erreur lors de l'ajout de l'activité:", error);
      throw error;
    }
  }

  static async addIssue(productionId: number, data: any): Promise<any> {
    try {
      const issue = await prisma.productionIssue.create({
        data: {
          productionId,
          issueDate: new Date(data.issueDate),
          type: data.type,
          description: data.description,
          severity: data.severity,
          actions: data.actions,
          cost: data.cost,
        },
      });

      return issue;
    } catch (error) {
      logger.error("Erreur lors de l'ajout du problème:", error);
      throw error;
    }
  }

  static async addWeatherData(productionId: number, data: any): Promise<any> {
    try {
      const weatherData = await prisma.weatherData.create({
        data: {
          productionId,
          recordDate: new Date(data.recordDate),
          temperature: data.temperature,
          rainfall: data.rainfall,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          notes: data.notes,
          source: data.source,
        },
      });

      return weatherData;
    } catch (error) {
      logger.error("Erreur lors de l'ajout des données météo:", error);
      throw error;
    }
  }
}
