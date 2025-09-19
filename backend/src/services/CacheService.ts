import Redis from "ioredis";
import { config } from "../config/environment";
import { logger } from "../utils/logger";
import { prisma } from "../config/database";
import { LotStatus } from "@prisma/client"; // ✅ Correct enum Prisma

export class CacheService {
  private static redis: Redis | null = null;
  private static localCache = new Map<string, { value: any; expiry: number }>();

  static async init() {
    try {
      if (config.redis.host) {
        this.redis = new Redis({
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db,
        });

        this.redis.on("error", (err: Error) => {
          logger.error("Redis connection error:", err);
          this.redis = null;
        });

        logger.info("Redis cache initialized");
      }
    } catch (error) {
      logger.warn("Redis initialization failed, using local cache:", error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) return JSON.parse(value);
      }

      const cached = this.localCache.get(key);
      if (cached && cached.expiry > Date.now()) return cached.value;

      if (cached) this.localCache.delete(key);

      return null;
    } catch (error) {
      logger.error("Cache get error:", error);
      return null;
    }
  }

  static async set<T>(key: string, value: T, ttlSeconds: number = 300) {
    try {
      const serialized = JSON.stringify(value);

      if (this.redis) await this.redis.setex(key, ttlSeconds, serialized);

      this.localCache.set(key, {
        value,
        expiry: Date.now() + ttlSeconds * 1000,
      });

      if (this.localCache.size > 1000) this.cleanupLocalCache();
    } catch (error) {
      logger.error("Cache set error:", error);
    }
  }

  static async invalidate(pattern: string) {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) await this.redis.del(...keys);
      }

      for (const key of this.localCache.keys()) {
        if (key.includes(pattern.replace("*", ""))) this.localCache.delete(key);
      }
    } catch (error) {
      logger.error("Cache invalidation error:", error);
    }
  }

  private static cleanupLocalCache() {
    const now = Date.now();
    for (const [key, value] of this.localCache.entries()) {
      if (value.expiry < now) this.localCache.delete(key);
    }
  }

  static async getVarieties() {
    const key = "varieties:all:active";
    let varieties = await this.get(key);

    if (!varieties) {
      varieties = await prisma.variety.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });

      await this.set(key, varieties, 3600);
    }

    return varieties;
  }

  static async getSeedLotStats() {
    const key = "stats:seedlots:summary";
    let stats = await this.get(key);

    if (!stats) {
      const [total, certified, pending, byLevel] = await Promise.all([
        prisma.seedLot.count({ where: { isActive: true } }),
        prisma.seedLot.count({
          where: { isActive: true, status: LotStatus.certified }, // ✅ Enum correct
        }),
        prisma.seedLot.count({
          where: { isActive: true, status: LotStatus.pending }, // ✅ Enum correct
        }),
        prisma.seedLot.groupBy({
          by: ["level"],
          where: { isActive: true },
          _count: { id: true },
        }),
      ]);

      stats = { total, certified, pending, byLevel };
      await this.set(key, stats, 600);
    }

    return stats;
  }
}
