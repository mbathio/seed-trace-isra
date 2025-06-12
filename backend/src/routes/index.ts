// backend/src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import seedLotRoutes from "./seed-lots";
import varietyRoutes from "./varieties";
import multiplierRoutes from "./multipliers";
import parcelRoutes from "./parcels";
import productionRoutes from "./productions";
import qualityControlRoutes from "./quality-controls";
import reportRoutes from "./reports";
import statisticsRoutes from "./statistics";
import exportRoutes from "./export";

const router = Router();

// Montage des routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/seed-lots", seedLotRoutes);
router.use("/varieties", varietyRoutes);
router.use("/multipliers", multiplierRoutes);
router.use("/parcels", parcelRoutes);
router.use("/productions", productionRoutes);
router.use("/quality-controls", qualityControlRoutes);
router.use("/reports", reportRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/export", exportRoutes);

export default router;
