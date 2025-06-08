// backend/src/services/ParcelService.ts
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

      const skip = (page - 1) * pageSize;

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
          take: pageSize,
        }),
        prisma.parcel.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        parcels,
        total,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des parcelles:", error);
      throw error;
    }
  }

  static async getParcelById(id: number): Promise<any> {
    try {
      const parcel = await prisma.parcel.findUnique({
        where: { id, isActive: true },
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
}
