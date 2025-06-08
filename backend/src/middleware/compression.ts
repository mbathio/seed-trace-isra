// backend/src/middleware/compression.ts
import compression from "compression";

export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Compresser seulement si > 1KB
  level: 6, // Niveau de compression (1-9)
});
