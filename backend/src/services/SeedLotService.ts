// backend/src/services/SeedLotService.ts
import { prisma } from "../config/database";
import { EncryptionService } from "../utils/encryption";
import { QRCodeService } from "../utils/qrCode";
import { logger } from "../utils/logger";
import { CreateSeedLotData, UpdateSeedLotData } from "../types/entities";
import { PaginationQuery } from "../types/api";
import { SeedLevel, LotStatus } from "@prisma/client";
import { DataTransformer } from "../utils/transformers";

export class SeedLotService {
  static async createSeedLot(data: CreateSeedLotData): Promise<any> {
    try {
      // Générer un ID unique pour le lot
      const lotId = EncryptionService.generateLotId(data.level);

      // Gestion correcte de varietyId (number ou string)
      let varietyId: number;
      if (typeof data.varietyId === "string") {
        // Si c'est un string, essayer de le parser comme nombre
        const parsedId = parseInt(data.varietyId);
        if (!isNaN(parsedId)) {
          varietyId = parsedId;
        } else {
          // Si ce n'est pas un nombre, chercher par code
          const variety = await prisma.variety.findFirst({
            where: { code: data.varietyId, isActive: true },
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

      // Validation de la hiérarchie parent-enfant si parentLotId est fourni
      if (data.parentLotId) {
        const parentLot = await prisma.seedLot.findUnique({
          where: { id: data.parentLotId, isActive: true },
        });

        if (!parentLot) {
          throw new Error("Lot parent non trouvé");
        }

        // Vérifier la hiérarchie des niveaux
        const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
        const parentIndex = levelHierarchy.indexOf(parentLot.level);
        const childIndex = levelHierarchy.indexOf(data.level);

        if (parentIndex >= childIndex) {
          throw new Error(
            `Un lot ${data.level} ne peut pas être créé à partir d'un lot ${parentLot.level}`
          );
        }
      }

      // Transformer le statut du frontend vers la DB
      const dbStatus = data.status
        ? (DataTransformer.transformInputStatus(data.status) as LotStatus)
        : LotStatus.PENDING;

      // Créer le lot de semences
      const seedLot = await prisma.seedLot.create({
        data: {
          id: lotId,
          varietyId,
          level: data.level as SeedLevel,
          quantity: data.quantity,
          productionDate: new Date(data.productionDate),
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          multiplierId: data.multiplierId,
          parcelId: data.parcelId,
          parentLotId: data.parentLotId,
          notes: data.notes,
          batchNumber: data.batchNumber,
          status: dbStatus,
        },
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          parentLot: {
            include: {
              variety: true,
            },
          },
        },
      });

      // Générer le QR code
      const qrCodeData = await QRCodeService.generateQRCode({
        lotId: seedLot.id,
        varietyName: seedLot.variety.name,
        level: seedLot.level,
        timestamp: new Date().toISOString(),
      });

      // Mettre à jour le lot avec le QR code
      const updatedSeedLot = await prisma.seedLot.update({
        where: { id: lotId },
        data: { qrCode: qrCodeData },
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          parentLot: {
            include: {
              variety: true,
            },
          },
        },
      });

      // Transformer les données pour le frontend
      return DataTransformer.transformSeedLot(updatedSeedLot);
    } catch (error) {
      logger.error("Erreur lors de la création du lot:", error);
      throw error;
    }
  }

  static async getSeedLots(
    query: PaginationQuery & any
  ): Promise<{ lots: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        level,
        status,
        varietyId,
        multiplierId,
        sortBy = "productionDate",
        sortOrder = "desc",
      } = query;

      const skip = (page - 1) * pageSize;

      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { id: { contains: search, mode: "insensitive" } },
          { variety: { name: { contains: search, mode: "insensitive" } } },
          { variety: { code: { contains: search, mode: "insensitive" } } },
          { notes: { contains: search, mode: "insensitive" } },
          { batchNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      if (level) {
        // Le niveau vient du frontend en majuscules, pas besoin de transformation
        where.level = level as SeedLevel;
      }

      if (status) {
        // Transformer le statut du frontend vers la DB
        where.status = DataTransformer.transformInputStatus(
          status
        ) as LotStatus;
      }

      // Gestion améliorée de varietyId
      if (varietyId) {
        if (typeof varietyId === "string") {
          const parsedId = parseInt(varietyId);
          if (!isNaN(parsedId)) {
            where.varietyId = parsedId;
          } else {
            // Recherche par code
            where.variety = { code: varietyId };
          }
        } else {
          where.varietyId = varietyId;
        }
      }

      if (multiplierId) {
        where.multiplierId = parseInt(multiplierId);
      }

      const [lots, total] = await Promise.all([
        prisma.seedLot.findMany({
          where,
          include: {
            variety: true,
            multiplier: true,
            parcel: true,
            parentLot: {
              include: {
                variety: true,
              },
            },
            qualityControls: {
              orderBy: { controlDate: "desc" },
              take: 1,
              include: {
                inspector: {
                  select: { id: true, name: true, email: true },
                },
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
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSize,
        }),
        prisma.seedLot.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      // Transformer les données pour le frontend
      const transformedLots = lots.map((lot) =>
        DataTransformer.transformSeedLot(lot)
      );

      return {
        lots: transformedLots,
        total,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des lots:", error);
      throw error;
    }
  }

  static async getSeedLotById(id: string): Promise<any> {
    try {
      const seedLot = await prisma.seedLot.findUnique({
        where: { id, isActive: true },
        include: {
          variety: true,
          multiplier: true,
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
            where: { isActive: true },
            include: {
              variety: true,
              multiplier: true,
              qualityControls: {
                orderBy: { controlDate: "desc" },
                take: 1,
              },
            },
          },
          qualityControls: {
            include: {
              inspector: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
            orderBy: { controlDate: "desc" },
          },
          productions: {
            include: {
              multiplier: true,
              parcel: true,
              _count: {
                select: {
                  activities: true,
                  issues: true,
                  weatherData: true,
                },
              },
            },
            orderBy: { startDate: "desc" },
          },
        },
      });

      if (!seedLot) {
        return null;
      }

      // Transformer les données pour le frontend
      return DataTransformer.transformSeedLot(seedLot);
    } catch (error) {
      logger.error("Erreur lors de la récupération du lot:", error);
      throw error;
    }
  }

  static async updateSeedLot(
    id: string,
    data: UpdateSeedLotData
  ): Promise<any> {
    try {
      const updateData: any = {};

      if (data.quantity !== undefined) {
        updateData.quantity = data.quantity;
      }

      if (data.status) {
        // Transformer le statut du frontend vers la DB
        updateData.status = DataTransformer.transformInputStatus(
          data.status
        ) as LotStatus;
      }

      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }

      if (data.expiryDate) {
        updateData.expiryDate = new Date(data.expiryDate);
      }

      updateData.updatedAt = new Date();

      const seedLot = await prisma.seedLot.update({
        where: { id },
        data: updateData,
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          parentLot: {
            include: {
              variety: true,
            },
          },
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
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

      // Transformer les données pour le frontend
      return DataTransformer.transformSeedLot(seedLot);
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du lot:", error);
      throw error;
    }
  }

  static async deleteSeedLot(id: string): Promise<void> {
    try {
      // Vérifier s'il y a des lots enfants
      const childLotsCount = await prisma.seedLot.count({
        where: { parentLotId: id, isActive: true },
      });

      if (childLotsCount > 0) {
        throw new Error(
          "Impossible de supprimer ce lot car il a des lots enfants actifs"
        );
      }

      // Soft delete
      await prisma.seedLot.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      logger.info(`Lot ${id} supprimé avec succès`);
    } catch (error) {
      logger.error("Erreur lors de la suppression du lot:", error);
      throw error;
    }
  }

  static async getGenealogyTree(lotId: string): Promise<any> {
    try {
      const lot = await this.getSeedLotById(lotId);
      if (!lot) {
        return null;
      }

      // Récupérer tous les ancêtres
      const ancestors = await this.getAncestors(lotId);

      // Récupérer tous les descendants
      const descendants = await this.getDescendants(lotId);

      return {
        currentLot: lot,
        ancestors,
        descendants,
        totalGenerations: this.calculateGenerations(ancestors, descendants),
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération de la généalogie:", error);
      throw error;
    }
  }

  private static async getAncestors(lotId: string): Promise<any[]> {
    const ancestors = [];
    let currentLotId = lotId;

    while (currentLotId) {
      const lot = await prisma.seedLot.findUnique({
        where: { id: currentLotId, isActive: true },
        include: {
          variety: true,
          parentLot: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
          multiplier: true,
        },
      });

      if (!lot || !lot.parentLotId) {
        break;
      }

      // Transformer et ajouter le lot parent
      ancestors.push(DataTransformer.transformSeedLot(lot.parentLot));
      currentLotId = lot.parentLotId;
    }

    return ancestors;
  }

  private static async getDescendants(lotId: string): Promise<any[]> {
    const descendants = await prisma.seedLot.findMany({
      where: { parentLotId: lotId, isActive: true },
      include: {
        variety: true,
        multiplier: true,
        qualityControls: {
          orderBy: { controlDate: "desc" },
          take: 1,
        },
        _count: {
          select: {
            childLots: true,
          },
        },
      },
    });

    // Récupérer récursivement les descendants de chaque descendant
    const transformedDescendants = [];
    for (const descendant of descendants) {
      const transformed = DataTransformer.transformSeedLot(descendant);
      transformed.childLots = await this.getDescendants(descendant.id);
      transformedDescendants.push(transformed);
    }

    return transformedDescendants;
  }

  private static calculateGenerations(
    ancestors: any[],
    descendants: any[]
  ): number {
    const ancestorGenerations = ancestors.length;
    const descendantGenerations = this.getMaxDepth(descendants);
    return ancestorGenerations + descendantGenerations + 1; // +1 pour le lot actuel
  }

  private static getMaxDepth(descendants: any[]): number {
    if (descendants.length === 0) return 0;

    let maxDepth = 0;
    for (const descendant of descendants) {
      const depth = 1 + this.getMaxDepth(descendant.childLots || []);
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  // Méthodes supplémentaires utiles

  static async getStatsByVariety(varietyId: number): Promise<any> {
    try {
      const stats = await prisma.seedLot.groupBy({
        by: ["level", "status"],
        where: {
          varietyId,
          isActive: true,
        },
        _count: {
          id: true,
        },
        _sum: {
          quantity: true,
        },
      });

      // Transformer les données pour le frontend
      const transformedStats = stats.map((stat) => ({
        level: stat.level,
        status: stat.status.toLowerCase().replace("_", "-"),
        count: stat._count.id,
        totalQuantity: stat._sum.quantity || 0,
      }));

      return transformedStats;
    } catch (error) {
      logger.error(
        "Erreur lors du calcul des statistiques par variété:",
        error
      );
      throw error;
    }
  }

  static async checkExpiringLots(daysAhead: number = 30): Promise<any[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const expiringLots = await prisma.seedLot.findMany({
        where: {
          isActive: true,
          expiryDate: {
            gte: new Date(),
            lte: futureDate,
          },
          status: {
            notIn: [LotStatus.REJECTED, LotStatus.SOLD],
          },
        },
        include: {
          variety: true,
          multiplier: true,
        },
        orderBy: {
          expiryDate: "asc",
        },
      });

      // Transformer les données pour le frontend
      return expiringLots.map((lot) => DataTransformer.transformSeedLot(lot));
    } catch (error) {
      logger.error("Erreur lors de la vérification des lots expirants:", error);
      throw error;
    }
  }

  static async transferLot(
    lotId: string,
    newMultiplierId: number,
    quantity: number,
    notes?: string
  ): Promise<any> {
    try {
      const sourceLot = await prisma.seedLot.findUnique({
        where: { id: lotId, isActive: true },
      });

      if (!sourceLot) {
        throw new Error("Lot source non trouvé");
      }

      if (sourceLot.quantity < quantity) {
        throw new Error("Quantité insuffisante dans le lot source");
      }

      // Créer une transaction pour assurer l'intégrité
      const result = await prisma.$transaction(async (tx) => {
        // Réduire la quantité du lot source
        const updatedSourceLot = await tx.seedLot.update({
          where: { id: lotId },
          data: {
            quantity: sourceLot.quantity - quantity,
            updatedAt: new Date(),
          },
        });

        // Créer un nouveau lot pour le nouveau multiplicateur
        const newLotId = EncryptionService.generateLotId(sourceLot.level);
        const newLot = await tx.seedLot.create({
          data: {
            id: newLotId,
            varietyId: sourceLot.varietyId,
            level: sourceLot.level,
            quantity,
            productionDate: sourceLot.productionDate,
            expiryDate: sourceLot.expiryDate,
            multiplierId: newMultiplierId,
            parcelId: sourceLot.parcelId,
            parentLotId: sourceLot.parentLotId,
            status: sourceLot.status,
            notes: notes || `Transféré depuis le lot ${lotId}`,
          },
          include: {
            variety: true,
            multiplier: true,
            parcel: true,
          },
        });

        // Générer le QR code pour le nouveau lot
        const qrCodeData = await QRCodeService.generateQRCode({
          lotId: newLot.id,
          varietyName: newLot.variety.name,
          level: newLot.level,
          timestamp: new Date().toISOString(),
        });

        const finalNewLot = await tx.seedLot.update({
          where: { id: newLotId },
          data: { qrCode: qrCodeData },
          include: {
            variety: true,
            multiplier: true,
            parcel: true,
          },
        });

        return {
          updatedSourceLot,
          newLot: finalNewLot,
        };
      });

      // Transformer les données pour le frontend
      return {
        updatedSourceLot: DataTransformer.transformSeedLot(
          result.updatedSourceLot
        ),
        newLot: DataTransformer.transformSeedLot(result.newLot),
      };
    } catch (error) {
      logger.error("Erreur lors du transfert du lot:", error);
      throw error;
    }
  }
}
