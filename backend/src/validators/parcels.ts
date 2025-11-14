import { z } from "zod";
import { ParcelStatus } from "@prisma/client";

/**
 * ✅ Schéma robuste : accepte aussi bien le format UI ('available', 'in-use', 'resting')
 * que le format DB ('AVAILABLE', 'IN_USE', 'RESTING')
 */
const parcelStatusSchema = z
  .union([
    z.enum(["available", "in-use", "resting"]),
    z.nativeEnum(ParcelStatus),
  ])
  .transform((val) =>
    typeof val === "string" ? val.toUpperCase().replace("-", "_") : val
  );

export const createParcelSchema = z.object({
  name: z.string().optional(),
  area: z.number().positive(),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  status: parcelStatusSchema.default("AVAILABLE"),
  soilType: z.string().optional(),
  irrigationSystem: z.string().optional(),
  address: z.string().optional(),
  multiplierId: z.number().optional(),
});

export const updateParcelSchema = createParcelSchema.partial();
