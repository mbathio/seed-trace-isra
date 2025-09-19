// backend/src/validators/parcels.ts - VERSION UNIFIÉE
import { z } from "zod";
import { ParcelStatus } from "@prisma/client"; // ✅ Enum Prisma direct
import { coordinatesSchema } from "./common";

// 🔹 Schéma de création de parcelle
export const createParcelSchema = z.object({
  name: z.string().max(100).optional(),
  area: z.number().positive(),
  ...coordinatesSchema.shape,
  status: z.nativeEnum(ParcelStatus).optional().default(ParcelStatus.available),
  soilType: z.string().max(100).optional(),
  irrigationSystem: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  multiplierId: z.number().positive().optional(),
});

// 🔹 Schéma de mise à jour (partiel)
export const updateParcelSchema = createParcelSchema.partial();

// 🔹 Schéma de requête
export const parcelQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(ParcelStatus).optional(),
  multiplierId: z.coerce.number().positive().optional(),
  sortBy: z.enum(["name", "area", "status", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// 🔹 Types TypeScript
export type CreateParcelInput = z.infer<typeof createParcelSchema>;
export type UpdateParcelInput = z.infer<typeof updateParcelSchema>;
export type ParcelQueryInput = z.infer<typeof parcelQuerySchema>;
