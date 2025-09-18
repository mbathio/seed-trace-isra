// backend/src/validators/parcels.ts - VERSION UNIFIÉE
import { z } from "zod";
import { ParcelStatusEnum, coordinatesSchema } from "./common";

export const createParcelSchema = z.object({
  name: z.string().max(100).optional(),
  area: z.number().positive(),
  ...coordinatesSchema.shape,
  status: ParcelStatusEnum.optional().default("AVAILABLE"),
  soilType: z.string().max(100).optional(),
  irrigationSystem: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  multiplierId: z.number().positive().optional(),
});

export const updateParcelSchema = createParcelSchema.partial();

export const parcelQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: ParcelStatusEnum.optional(),
  multiplierId: z.coerce.number().positive().optional(),
  sortBy: z.enum(["name", "area", "status", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
