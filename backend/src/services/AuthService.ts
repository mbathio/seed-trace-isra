// backend/src/services/AuthService.ts (corrigé)
import { prisma } from "../config/database";
import { EncryptionService } from "../utils/encryption";
import { logger } from "../utils/logger";
import { AuthTokens, JwtPayload } from "../types/api";
import { Role } from "@prisma/client";

export class AuthService {
  static async login(
    email: string,
    password: string
  ): Promise<{ user: any; tokens: AuthTokens } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email, isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
        },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await EncryptionService.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return null;
      }

      const tokenPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const tokens = EncryptionService.generateTokens(tokenPayload);

      // Sauvegarder le refresh token
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        },
      });

      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      logger.error("Erreur lors de la connexion:", error);
      throw error;
    }
  }

  static async refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        // Supprimer le token expiré
        if (tokenRecord) {
          await prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
          });
        }
        return null;
      }

      // Récupérer les informations utilisateur
      const user = await prisma.user.findUnique({
        where: { id: tokenRecord.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return null;
      }

      const tokenPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newTokens = EncryptionService.generateTokens(tokenPayload);

      // Remplacer l'ancien refresh token
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          token: newTokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return newTokens;
    } catch (error) {
      logger.error("Erreur lors du renouvellement des tokens:", error);
      throw error;
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    } catch (error) {
      logger.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<any> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      const hashedPassword = await EncryptionService.hashPassword(
        userData.password
      );

      // Conversion du rôle vers l'énumération Prisma
      const roleEnum = userData.role.toUpperCase() as Role;

      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: roleEnum,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  }

  static async getCurrentUser(userId: number): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'utilisateur:", error);
      throw error;
    }
  }
}
