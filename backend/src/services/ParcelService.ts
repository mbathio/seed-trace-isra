// backend/src/services/ParcelService.ts - VERSION UNIFIÉE
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import { ParcelStatus } from "@prisma/client";

export class ParcelService {
  // Création d'une parcelle
  static async createParcel(data: any) {
    try {
      const parcel = await prisma.parcel.create({
        data: {
          name: data.name,
          area: data.area,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status || ParcelStatus.available,
          soilType: data.soilType,
          irrigationSystem: data.irrigationSystem,
          address: data.address,
          multiplierId: data.multiplierId,
        },
        include: { multiplier: true },
      });
      return parcel;
    } catch (error) {
      logger.error("Erreur lors de la création de la parcelle:", error);
      throw error;
    }
  }

  // Récupération paginée des parcelles
  static async getParcels(query: PaginationQuery & any) {
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

      const pageNum = typeof page === "string" ? parseInt(page, 10) : page;
      const pageSizeNum =
        typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;
      const skip = (pageNum - 1) * pageSizeNum;

      const where: any = { isActive: true };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { soilType: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) where.status = status;
      if (multiplierId) where.multiplierId = parseInt(multiplierId);

      const [parcels, total] = await Promise.all([
        prisma.parcel.findMany({
          where,
          include: {
            multiplier: true,
            soilAnalyses: { orderBy: { analysisDate: "desc" }, take: 1 },
            _count: { select: { seedLots: true, productions: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSizeNum,
        }),
        prisma.parcel.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSizeNum);

      return {
        parcels,
        total,
        meta: {
          page: pageNum,
          pageSize: pageSizeNum,
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

  // Récupération d'une parcelle par ID
  static async getParcelById(id: number) {
    try {
      return await prisma.parcel.findFirst({
        where: { id, isActive: true },
        include: {
          multiplier: true,
          soilAnalyses: { orderBy: { analysisDate: "desc" } },
          previousCrops: { orderBy: { year: "desc" } },
          seedLots: {
            include: { variety: true },
            orderBy: { productionDate: "desc" },
          },
          productions: {
            include: { seedLot: { include: { variety: true } } },
            orderBy: { startDate: "desc" },
          },
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la récupération de la parcelle:", error);
      throw error;
    }
  }

  // Mise à jour d'une parcelle
  static async updateParcel(id: number, data: any) {
    try {
      return await prisma.parcel.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
        include: { multiplier: true },
      });
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de la parcelle:", error);
      throw error;
    }
  }

  // Suppression logique d'une parcelle
  static async deleteParcel(id: number) {
    try {
      await prisma.parcel.update({ where: { id }, data: { isActive: false } });
    } catch (error) {
      logger.error("Erreur lors de la suppression de la parcelle:", error);
      throw error;
    }
  }

  // Ajout d'une analyse de sol
  static async addSoilAnalysis(parcelId: number, data: any) {
    try {
      return await prisma.soilAnalysis.create({
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
    } catch (error) {
      logger.error("Erreur lors de l'ajout de l'analyse de sol:", error);
      throw error;
    }
  }

  // Récupération des analyses de sol d'une parcelle
  static async getSoilAnalyses(parcelId: number) {
    try {
      return await prisma.soilAnalysis.findMany({
        where: { parcelId },
        orderBy: { analysisDate: "desc" },
      });
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des analyses de sol:",
        error
      );
      throw error;
    }
  }

  // Statistiques des parcelles
  static async getStatistics() {
    try {
      const [total, disponibles, enUtilisation, auRepos, surfaceTotale] =
        await Promise.all([
          prisma.parcel.count({ where: { isActive: true } }),
          prisma.parcel.count({
            where: { isActive: true, status: ParcelStatus.available },
          }),
          prisma.parcel.count({
            where: { isActive: true, status: ParcelStatus.in_use },
          }),
          prisma.parcel.count({
            where: { isActive: true, status: ParcelStatus.resting },
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

  // Vérifier disponibilité d'une parcelle pour une période donnée
  static async checkAvailability(
    parcelId: number,
    startDate: string,
    endDate: string
  ) {
    try {
      const count = await prisma.production.count({
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
      return count === 0;
    } catch (error) {
      logger.error("Erreur lors de la vérification de disponibilité:", error);
      throw error;
    }
  }

  // Assigner un multiplicateur à une parcelle
  static async assignMultiplier(parcelId: number, multiplierId: number) {
    try {
      return await prisma.parcel.update({
        where: { id: parcelId },
        data: { multiplierId, updatedAt: new Date() },
        include: { multiplier: true },
      });
    } catch (error) {
      logger.error("Erreur lors de l'assignation du multiplicateur:", error);
      throw error;
    }
  }

  // Historique complet d'une parcelle
  static async getHistory(parcelId: number) {
    try {
      const [productions, soilAnalyses, previousCrops] = await Promise.all([
        prisma.production.findMany({
          where: { parcelId },
          include: { seedLot: { include: { variety: true } } },
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

      return { productions, soilAnalyses, previousCrops };
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'historique:", error);
      throw error;
    }
  }
}
