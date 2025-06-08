// backend/src/utils/encryption.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
      throw new Error("JWT_SECRET must be a valid string");
    }

    // ✅ Conversion explicite des options pour TypeScript
    const accessToken = jwt.sign(
      payload,
      secret as jwt.Secret,
      {
        expiresIn: config.jwt.accessTokenExpiry,
      } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      secret as jwt.Secret,
      {
        expiresIn: config.jwt.refreshTokenExpiry,
      } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): JwtPayload {
    const secret = config.jwt.secret;

    if (!secret || typeof secret !== "string") {
      throw new Error("JWT_SECRET must be a valid string");
    }

    return jwt.verify(token, secret as jwt.Secret) as JwtPayload;
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
