// backend/src/services/UserService.ts (corrections)
import { prisma } from "../config/database";
import { EncryptionService } from "../utils/encryption";
import { logger } from "../utils/logger";
import { PaginationQuery } from "../types/api";

export class UserService {
  static async getUsers(
    query: PaginationQuery & any
  ): Promise<{ users: any[]; total: number; meta: any }> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        role,
        isActive,
        sortBy = "name",
        sortOrder = "asc",
      } = query;

      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                qualityControls: true,
                reports: true,
                activities: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSize,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        users,
        total,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  }

  static async getUserById(id: number): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          qualityControls: {
            include: {
              seedLot: {
                include: {
                  variety: true,
                },
              },
            },
            orderBy: { controlDate: "desc" },
            take: 10,
          },
          reports: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          activities: {
            include: {
              production: {
                include: {
                  seedLot: {
                    include: {
                      variety: true,
                    },
                  },
                },
              },
            },
            orderBy: { activityDate: "desc" },
            take: 10,
          },
          _count: {
            select: {
              qualityControls: true,
              reports: true,
              activities: true,
            },
          },
        },
      });

      return user;
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  }

  static async createUser(data: any): Promise<any> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      const hashedPassword = await EncryptionService.hashPassword(
        data.password
      );

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role,
          avatar: data.avatar,
          isActive: data.isActive !== false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  static async updateUser(id: number, data: any): Promise<any> {
    try {
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.role) updateData.role = data.role;
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      // Vérifier l'unicité de l'email si modifié
      if (data.email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: data.email, id: { not: id } },
        });

        if (existingUser) {
          throw new Error("Un utilisateur avec cet email existe déjà");
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      throw error;
    }
  }

  static async deleteUser(id: number): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      logger.error("Erreur lors de la suppression de l'utilisateur:", error);
      throw error;
    }
  }

  static async updatePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { password: true },
      });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      const isCurrentPasswordValid = await EncryptionService.comparePassword(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new Error("Mot de passe actuel incorrect");
      }

      const hashedNewPassword =
        await EncryptionService.hashPassword(newPassword);

      await prisma.user.update({
        where: { id },
        data: { password: hashedNewPassword },
      });
    } catch (error) {
      logger.error("Erreur lors de la mise à jour du mot de passe:", error);
      throw error;
    }
  }
}
