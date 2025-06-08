// backend/src/middleware/geoValidation.ts
import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/response";

// Limites géographiques du Sénégal
const SENEGAL_BOUNDS = {
  latMin: 12.0,
  latMax: 16.7,
  lngMin: -17.6,
  lngMax: -11.3,
};

export function validateCoordinates(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  const { latitude, longitude } = req.body;

  if (latitude !== undefined || longitude !== undefined) {
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return ResponseHandler.validationError(res, [
        "Coordonnées GPS invalides. Latitude: [-90, 90], Longitude: [-180, 180]",
      ]);
    }

    // Validation spécifique pour le Sénégal avec avertissement
    if (
      latitude < SENEGAL_BOUNDS.latMin ||
      latitude > SENEGAL_BOUNDS.latMax ||
      longitude < SENEGAL_BOUNDS.lngMin ||
      longitude > SENEGAL_BOUNDS.lngMax
    ) {
      console.warn("⚠️ Coordonnées en dehors du Sénégal:", {
        latitude,
        longitude,
        bounds: SENEGAL_BOUNDS,
      });
    }
  }

  next();
}
