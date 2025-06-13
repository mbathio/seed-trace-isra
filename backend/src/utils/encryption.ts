import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/environment";
import { JwtPayload, AuthTokens } from "../types/api";

export class EncryptionService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateTokens(payload: JwtPayload): AuthTokens {
    const secret = config.jwt.secret;

    if (!secret || typeof secret !== "string") {
      throw new Error("JWT_SECRET doit être une chaîne de caractères valide");
    }

    // Préparer le payload commun
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    // ✅ CORRECTION: Cast explicite pour les valeurs expiresIn
    const accessTokenOptions: SignOptions = {
      expiresIn: config.jwt.accessTokenExpiry as any,
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: config.jwt.refreshTokenExpiry as any,
    };

    const accessToken = jwt.sign(tokenPayload, secret, accessTokenOptions);
    const refreshToken = jwt.sign(
      { userId: payload.userId },
      secret,
      refreshTokenOptions
    );

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): JwtPayload {
    const secret = config.jwt.secret;

    if (!secret || typeof secret !== "string") {
      throw new Error("JWT_SECRET doit être une chaîne de caractères valide");
    }

    try {
      const decoded = jwt.verify(token, secret) as any;

      if (!decoded.userId) {
        throw new Error("Token invalide: userId manquant");
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token expiré");
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Token invalide");
      } else if (error.name === "NotBeforeError") {
        throw new Error("Token pas encore valide");
      } else {
        throw new Error("Erreur de vérification du token");
      }
    }
  }

  static generateLotId(level: string, year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `SL-${level}-${currentYear}-${randomNum}`;
  }

  static generateSecureToken(length: number = 32): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
