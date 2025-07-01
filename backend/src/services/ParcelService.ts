// backend/src/services/ParcelService.ts - VERSION CORRIGÉE
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import { ParcelStatus } from "@prisma/client";

export class ParcelService {
  static async createParcel(data: any): Promise<any> {
    try {
      const parcel = await prisma.parcel.create({
        data: {
          name: data.name,
          area: data.area,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status || ParcelStatus.AVAILABLE,
          soilType: data.soilType,
          irrigationSystem: data.irrigationSystem,
          address: data.address,
          multiplierId: data.multiplierId,
        },
        include: {
          multiplier: true,
        },
      });

      return parcel;
    } catch (error) {
      logger.error("Erreur lors de la création de la parcelle:", error);
      throw error;
    }
  }

  static async getParcels(
    query: PaginationQuery & any
  ): Promise<{ parcels: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        status,
        multiplierId,
        sortBy = "name",
        sortOrder = "asc",
      } = query;

      // ✅ CORRECTION: Convertir page et pageSize en nombres
      const pageNum = typeof page === "string" ? parseInt(page, 10) : page;
      const pageSizeNum =
        typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;

      const skip = (pageNum - 1) * pageSizeNum;
      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { soilType: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (multiplierId) {
        where.multiplierId = parseInt(multiplierId);
      }

      const [parcels, total] = await Promise.all([
        prisma.parcel.findMany({
          where,
          include: {
            multiplier: true,
            soilAnalyses: {
              orderBy: { analysisDate: "desc" },
              take: 1,
            },
            _count: {
              select: {
                seedLots: true,
                productions: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSizeNum, // ✅ CORRECTION: Utiliser pageSizeNum
        }),
        prisma.parcel.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSizeNum); // ✅ CORRECTION: Utiliser pageSizeNum

      return {
        parcels,
        total,
        meta: {
          page: pageNum, // ✅ CORRECTION: Utiliser pageNum
          pageSize: pageSizeNum, // ✅ CORRECTION: Utiliser pageSizeNum
          totalCount: total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des parcelles:", error);
      throw error;
    }
  }

  // ✅ CORRECTION PRINCIPALE: Utiliser findFirst avec une combinaison de conditions
  static async getParcelById(id: number): Promise<any> {
    try {
      const parcel = await prisma.parcel.findFirst({
        where: {
          id: id,
          isActive: true,
        },
        include: {
          multiplier: true,
          soilAnalyses: {
            orderBy: { analysisDate: "desc" },
          },
          previousCrops: {
            orderBy: { year: "desc" },
          },
          seedLots: {
            include: {
              variety: true,
            },
            orderBy: { productionDate: "desc" },
          },
          productions: {
            include: {
              seedLot: {
                include: {
                  variety: true,
                },
              },
            },
            orderBy: { startDate: "desc" },
          },
        },
      });

      return parcel;
    } catch (error) {
      logger.error("Erreur lors de la récupération de la parcelle:", error);
      throw error;
    }
  }

  static async updateParcel(id: number, data: any): Promise<any> {
    try {
      const parcel = await prisma.parcel.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          multiplier: true,
        },
      });

      return parcel;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la parcelle:", error);
      throw error;
    }
  }

  static async deleteParcel(id: number): Promise<void> {
    try {
      await prisma.parcel.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      logger.error("Erreur lors de la suppression de la parcelle:", error);
      throw error;
    }
  }

  static async addSoilAnalysis(parcelId: number, data: any): Promise<any> {
    try {
      const analysis = await prisma.soilAnalysis.create({
        data: {
          parcelId,
          analysisDate: new Date(data.analysisDate),
          pH: data.pH,
          organicMatter: data.organicMatter,
          nitrogen: data.nitrogen,
          phosphorus: data.phosphorus,
          potassium: data.potassium,
          notes: data.notes,
        },
      });

      return analysis;
    } catch (error) {
      logger.error("Erreur lors de l'ajout de l'analyse de sol:", error);
      throw error;
    }
  }

  // ✅ NOUVELLE MÉTHODE: Récupérer les analyses de sol d'une parcelle
  static async getSoilAnalyses(parcelId: number): Promise<any[]> {
    try {
      const analyses = await prisma.soilAnalysis.findMany({
        where: { parcelId },
        orderBy: { analysisDate: "desc" },
      });

      return analyses;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des analyses de sol:",
        error
      );
      throw error;
    }
  }

  // ✅ NOUVELLE MÉTHODE: Récupérer les statistiques des parcelles
  static async getStatistics(): Promise<any> {
    try {
      const [total, disponibles, enUtilisation, auRepos, surfaceTotale] =
        await Promise.all([
          prisma.parcel.count({ where: { isActive: true } }),
          prisma.parcel.count({
            where: { isActive: true, status: ParcelStatus.AVAILABLE },
          }),
          prisma.parcel.count({
            where: { isActive: true, status: ParcelStatus.IN_USE },
          }),
          prisma.parcel.count({
            where: { isActive: true, status: ParcelStatus.RESTING },
          }),
          prisma.parcel.aggregate({
            where: { isActive: true },
            _sum: { area: true },
          }),
        ]);

      return {
        total,
        disponibles,
        enUtilisation,
        auRepos,
        surfaceTotale: surfaceTotale._sum.area || 0,
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  // ✅ NOUVELLE MÉTHODE: Vérifier la disponibilité d'une parcelle
  static async checkAvailability(
    parcelId: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      const conflictingProductions = await prisma.production.count({
        where: {
          parcelId,
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(startDate) } },
              ],
            },
            {
              AND: [
                { startDate: { gte: new Date(startDate) } },
                { startDate: { lte: new Date(endDate) } },
              ],
            },
          ],
        },
      });

      return conflictingProductions === 0;
    } catch (error) {
      logger.error("Erreur lors de la vérification de disponibilité:", error);
      throw error;
    }
  }

  // ✅ NOUVELLE MÉTHODE: Assigner un multiplicateur à une parcelle
  static async assignMultiplier(
    parcelId: number,
    multiplierId: number
  ): Promise<any> {
    try {
      const parcel = await prisma.parcel.update({
        where: { id: parcelId },
        data: {
          multiplierId,
          updatedAt: new Date(),
        },
        include: {
          multiplier: true,
        },
      });

      return parcel;
    } catch (error) {
      logger.error("Erreur lors de l'assignation du multiplicateur:", error);
      throw error;
    }
  }

  // ✅ NOUVELLE MÉTHODE: Récupérer l'historique d'une parcelle
  static async getHistory(parcelId: number): Promise<any> {
    try {
      const [productions, soilAnalyses, crops] = await Promise.all([
        prisma.production.findMany({
          where: { parcelId },
          include: {
            seedLot: {
              include: {
                variety: true,
              },
            },
          },
          orderBy: { startDate: "desc" },
        }),
        prisma.soilAnalysis.findMany({
          where: { parcelId },
          orderBy: { analysisDate: "desc" },
        }),
        prisma.previousCrop.findMany({
          where: { parcelId },
          orderBy: { year: "desc" },
        }),
      ]);

      return {
        productions,
        soilAnalyses,
        previousCrops: crops,
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'historique:", error);
      throw error;
    }
  }
}
