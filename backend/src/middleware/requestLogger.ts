import { Request, Response, NextFunction } from "express";
import { logger, performanceLogger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

interface RequestWithId extends Request {
  requestId?: string;
  startTime?: number;
}

export function requestLogger(
  req: RequestWithId,
  res: Response,
  next: NextFunction
) {
  // Générer un ID unique pour tracer la requête
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Logger le début de la requête
  logger.info("Incoming request", {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: (req as any).user?.userId,
  });

  // Intercepter la fin de la réponse
  const originalSend = res.send;
  res.send = function (data: any) {
    const responseTime = Date.now() - (req.startTime || 0);

    // Logger la performance
    performanceLogger.info("Request completed", {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userId: (req as any).user?.userId,
    });

    // Logger les requêtes lentes
    if (responseTime > 1000) {
      logger.warn("Slow request detected", {
        requestId: req.requestId,
        url: req.url,
        responseTime,
      });
    }

    return originalSend.call(this, data);
  };

  next();
}
