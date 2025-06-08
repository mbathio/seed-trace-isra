// backend/src/services/MultiplierService.ts
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";
import {
  MultiplierStatus,
  CertificationLevel,
  SeedLevel,
  ContractStatus,
} from "@prisma/client"; // ✅ Import des enums

export class MultiplierService {
  static async createMultiplier(data: any): Promise<any> {
    try {
      const multiplier = await prisma.multiplier.create({
        data: {
          name: data.name,
          status: data.status || MultiplierStatus.ACTIVE, // ✅ Utilisation de l'enum
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          yearsExperience: data.yearsExperience,
          certificationLevel: data.certificationLevel as CertificationLevel, // ✅ Cast vers l'enum
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

      const skip = (page - 1) * pageSize;

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
        where.status = status as MultiplierStatus; // ✅ Cast vers l'enum
      }

      if (certificationLevel) {
        where.certificationLevel = certificationLevel as CertificationLevel; // ✅ Cast vers l'enum
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
          take: pageSize,
        }),
        prisma.multiplier.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        multipliers,
        total,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages,
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
      // ✅ Validation des enums si fournis
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.yearsExperience !== undefined)
        updateData.yearsExperience = data.yearsExperience;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.specialization !== undefined)
        updateData.specialization = data.specialization;

      if (data.status !== undefined) {
        updateData.status = data.status as MultiplierStatus;
      }

      if (data.certificationLevel !== undefined) {
        updateData.certificationLevel =
          data.certificationLevel as CertificationLevel;
      }

      updateData.updatedAt = new Date();

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
      // ✅ Gestion correcte de varietyId (number ou string)
      let varietyId: number;

      if (typeof data.varietyId === "string") {
        // Essayer de parser comme nombre
        const parsedId = parseInt(data.varietyId);
        if (!isNaN(parsedId)) {
          varietyId = parsedId;
        } else {
          // Si ce n'est pas un nombre, chercher par code
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
          seedLevel: data.seedLevel as SeedLevel, // ✅ Cast vers l'enum
          expectedQuantity: data.expectedQuantity,
          parcelId: data.parcelId,
          paymentTerms: data.paymentTerms,
          notes: data.notes,
          status: (data.status as ContractStatus) || ContractStatus.DRAFT, // ✅ Cast vers l'enum
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
