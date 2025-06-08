import NodeCache from "node-cache";
import { prisma } from "../config/database";

export class CacheService {
  private static cache = new NodeCache({
    stdTTL: 300, // 5 minutes
    checkperiod: 60,
  });

  static async getVarieties(): Promise<any[]> {
    const cached = this.cache.get("varieties");
    if (cached) return cached as any[];

    const varieties = await prisma.variety.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    this.cache.set("varieties", varieties);
    return varieties;
  }

  static invalidateVarieties(): void {
    this.cache.del("varieties");
  }

  static async getMultipliers(): Promise<any[]> {
    const cached = this.cache.get("multipliers");
    if (cached) return cached as any[];

    const multipliers = await prisma.multiplier.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        status: true,
        certificationLevel: true,
      },
      orderBy: { name: "asc" },
    });

    this.cache.set("multipliers", multipliers);
    return multipliers;
  }

  static invalidateMultipliers(): void {
    this.cache.del("multipliers");
  }

  static clearAll(): void {
    this.cache.flushAll();
  }
}
