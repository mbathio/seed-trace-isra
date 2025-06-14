// backend/src/services/MultiplierService.ts - SERVICE CORRIGÉ
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import {
  MultiplierStatus,
  CertificationLevel,
  SeedLevel,
  ContractStatus,
  CropType,
} from "@prisma/client";

export class MultiplierService {
  static async createMultiplier(data: any): Promise<any> {
    try {
      const multiplier = await prisma.multiplier.create({
        data: {
          name: data.name,
          status: data.status || MultiplierStatus.ACTIVE,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          yearsExperience: data.yearsExperience,
          certificationLevel: data.certificationLevel,
          specialization: data.specialization || [],
          phone: data.phone,
          email: data.email,
        },
      });

      return multiplier;
    } catch (error) {
      logger.error("Erreur lors de la création du multiplicateur:", error);
      throw error;
    }
  }

  static async getMultipliers(
    query: PaginationQuery & any
  ): Promise<{ multipliers: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        status,
        certificationLevel,
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
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (certificationLevel) {
        where.certificationLevel = certificationLevel;
      }

      const [multipliers, total] = await Promise.all([
        prisma.multiplier.findMany({
          where,
          include: {
            _count: {
              select: {
                parcels: true,
                contracts: true,
                seedLots: true,
                productions: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSizeNum, // ✅ CORRECTION: Utiliser le nombre converti
        }),
        prisma.multiplier.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSizeNum);

      return {
        multipliers,
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
      logger.error(
        "Erreur lors de la récupération des multiplicateurs:",
        error
      );
      throw error;
    }
  }

  static async getMultiplierById(id: number): Promise<any> {
    try {
      const multiplier = await prisma.multiplier.findUnique({
        where: { id, isActive: true },
        include: {
          parcels: {
            include: {
              soilAnalyses: {
                orderBy: { analysisDate: "desc" },
                take: 1,
              },
            },
          },
          contracts: {
            include: {
              variety: true,
            },
            orderBy: { startDate: "desc" },
          },
          seedLots: {
            include: {
              variety: true,
            },
            orderBy: { productionDate: "desc" },
            take: 10,
          },
          productions: {
            include: {
              seedLot: {
                include: {
                  variety: true,
                },
              },
              parcel: true,
            },
            orderBy: { startDate: "desc" },
            take: 10,
          },
          history: {
            orderBy: { year: "desc" },
            take: 5,
          },
        },
      });

      return multiplier;
    } catch (error) {
      logger.error("Erreur lors de la récupération du multiplicateur:", error);
      throw error;
    }
  }

  static async updateMultiplier(id: number, data: any): Promise<any> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Copier uniquement les champs définis
      if (data.name !== undefined) updateData.name = data.name;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.yearsExperience !== undefined)
        updateData.yearsExperience = data.yearsExperience;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.certificationLevel !== undefined)
        updateData.certificationLevel = data.certificationLevel;
      if (data.specialization !== undefined)
        updateData.specialization = data.specialization;

      const multiplier = await prisma.multiplier.update({
        where: { id },
        data: updateData,
      });

      return multiplier;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du multiplicateur:", error);
      throw error;
    }
  }

  static async deleteMultiplier(id: number): Promise<void> {
    try {
      await prisma.multiplier.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      logger.error("Erreur lors de la suppression du multiplicateur:", error);
      throw error;
    }
  }

  static async getMultiplierContracts(multiplierId: number): Promise<any[]> {
    try {
      const contracts = await prisma.contract.findMany({
        where: { multiplierId },
        include: {
          variety: true,
        },
        orderBy: { startDate: "desc" },
      });

      return contracts;
    } catch (error) {
      logger.error("Erreur lors de la récupération des contrats:", error);
      throw error;
    }
  }

  static async createContract(data: any): Promise<any> {
    try {
      // Gestion correcte de varietyId (number ou string)
      let varietyId: number;

      if (typeof data.varietyId === "string") {
        const parsedId = parseInt(data.varietyId);
        if (!isNaN(parsedId)) {
          varietyId = parsedId;
        } else {
          // Si c'est un code, chercher la variété
          const variety = await prisma.variety.findFirst({
            where: { code: data.varietyId },
          });
          if (!variety) {
            throw new Error(
              `Variété non trouvée avec le code: ${data.varietyId}`
            );
          }
          varietyId = variety.id;
        }
      } else {
        varietyId = data.varietyId;
      }

      const contract = await prisma.contract.create({
        data: {
          multiplierId: data.multiplierId,
          varietyId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          seedLevel: data.seedLevel as SeedLevel,
          expectedQuantity: data.expectedQuantity,
          parcelId: data.parcelId,
          paymentTerms: data.paymentTerms,
          notes: data.notes,
          status: data.status || ContractStatus.DRAFT,
        },
        include: {
          variety: true,
          multiplier: true,
        },
      });

      return contract;
    } catch (error) {
      logger.error("Erreur lors de la création du contrat:", error);
      throw error;
    }
  }
}
