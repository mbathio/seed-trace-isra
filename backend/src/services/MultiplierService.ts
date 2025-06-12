// ===== 3. backend/src/services/MultiplierService.ts - MISE À JOUR AVEC TRANSFORMATEURS =====
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
import { DataTransformer } from "../utils/transformers"; // ✅ AJOUTÉ

export class MultiplierService {
  static async createMultiplier(data: any): Promise<any> {
    try {
      // ✅ TRANSFORMATION : Transformer les données UI vers DB
      const transformedStatus = data.status
        ? (DataTransformer.transformMultiplierStatusUIToDB(
            data.status
          ) as MultiplierStatus)
        : MultiplierStatus.ACTIVE;

      const transformedCertificationLevel =
        DataTransformer.transformCertificationLevelUIToDB(
          data.certificationLevel
        ) as CertificationLevel;

      const transformedSpecialization =
        data.specialization?.map((spec: string) =>
          DataTransformer.transformCropTypeUIToDB(spec)
        ) || [];

      const multiplier = await prisma.multiplier.create({
        data: {
          name: data.name,
          status: transformedStatus,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          yearsExperience: data.yearsExperience,
          certificationLevel: transformedCertificationLevel,
          specialization: transformedSpecialization,
          phone: data.phone,
          email: data.email,
        },
      });

      // ✅ TRANSFORMATION : Transformer les données pour le frontend
      return DataTransformer.transformMultiplier(multiplier);
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
        // ✅ TRANSFORMATION : Transformer le statut UI vers DB
        where.status = DataTransformer.transformMultiplierStatusUIToDB(
          status
        ) as MultiplierStatus;
      }

      if (certificationLevel) {
        // ✅ TRANSFORMATION : Transformer le niveau de certification UI vers DB
        where.certificationLevel =
          DataTransformer.transformCertificationLevelUIToDB(
            certificationLevel
          ) as CertificationLevel;
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

      // ✅ TRANSFORMATION : Transformer tous les multiplicateurs pour le frontend
      const transformedMultipliers = multipliers.map((multiplier) =>
        DataTransformer.transformMultiplier(multiplier)
      );

      return {
        multipliers: transformedMultipliers,
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

      if (!multiplier) {
        return null;
      }

      // ✅ TRANSFORMATION : Transformer le multiplicateur et ses relations
      const transformedMultiplier =
        DataTransformer.transformMultiplier(multiplier);

      // Transformer les relations
      if (transformedMultiplier.contracts) {
        transformedMultiplier.contracts = transformedMultiplier.contracts.map(
          (contract: any) => ({
            ...contract,
            variety: DataTransformer.transformVariety(contract.variety),
            status:
              contract.status?.toLowerCase().replace(/_/g, "-") ||
              contract.status,
          })
        );
      }

      if (transformedMultiplier.seedLots) {
        transformedMultiplier.seedLots = transformedMultiplier.seedLots.map(
          (lot: any) => DataTransformer.transformSeedLot(lot)
        );
      }

      if (transformedMultiplier.productions) {
        transformedMultiplier.productions =
          transformedMultiplier.productions.map((production: any) =>
            DataTransformer.transformProduction(production)
          );
      }

      return transformedMultiplier;
    } catch (error) {
      logger.error("Erreur lors de la récupération du multiplicateur:", error);
      throw error;
    }
  }

  static async updateMultiplier(id: number, data: any): Promise<any> {
    try {
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.yearsExperience !== undefined)
        updateData.yearsExperience = data.yearsExperience;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;

      // ✅ TRANSFORMATION : Transformer les enums si fournis
      if (data.status !== undefined) {
        updateData.status = DataTransformer.transformMultiplierStatusUIToDB(
          data.status
        );
      }

      if (data.certificationLevel !== undefined) {
        updateData.certificationLevel =
          DataTransformer.transformCertificationLevelUIToDB(
            data.certificationLevel
          );
      }

      if (data.specialization !== undefined) {
        updateData.specialization = data.specialization.map((spec: string) =>
          DataTransformer.transformCropTypeUIToDB(spec)
        );
      }

      updateData.updatedAt = new Date();

      const multiplier = await prisma.multiplier.update({
        where: { id },
        data: updateData,
      });

      // ✅ TRANSFORMATION : Transformer les données pour le frontend
      return DataTransformer.transformMultiplier(multiplier);
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

      // ✅ TRANSFORMATION : Transformer les contrats pour le frontend
      return contracts.map((contract) => ({
        ...contract,
        status:
          contract.status?.toLowerCase().replace(/_/g, "-") || contract.status,
        variety: DataTransformer.transformVariety(contract.variety),
        startDate: contract.startDate?.toISOString().split("T")[0],
        endDate: contract.endDate?.toISOString().split("T")[0],
      }));
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

      // ✅ TRANSFORMATION : Transformer le statut du contrat UI vers DB
      const transformedStatus = data.status
        ? (DataTransformer.transformEnumUIToDB(data.status, {
            draft: "DRAFT",
            active: "ACTIVE",
            completed: "COMPLETED",
            cancelled: "CANCELLED",
          }) as ContractStatus)
        : ContractStatus.DRAFT;

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
          status: transformedStatus,
        },
        include: {
          variety: true,
          multiplier: true,
        },
      });

      // ✅ TRANSFORMATION : Transformer le contrat pour le frontend
      return {
        ...contract,
        status: contract.status?.toLowerCase().replace(/_/g, "-"),
        variety: DataTransformer.transformVariety(contract.variety),
        multiplier: DataTransformer.transformMultiplier(contract.multiplier),
        startDate: contract.startDate?.toISOString().split("T")[0],
        endDate: contract.endDate?.toISOString().split("T")[0],
      };
    } catch (error) {
      logger.error("Erreur lors de la création du contrat:", error);
      throw error;
    }
  }
}
