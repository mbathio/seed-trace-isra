import { Router } from "express";
import { QualityControlController } from "../controllers/QualityControlController";
import { validateRequest } from "../middleware/validation";
import { requireRole } from "../middleware/auth";
import { fullTransformation } from "../middleware/transformationMiddleware";
import { prisma } from "../lib/prisma";
import {
  createQualityControlSchema,
  updateQualityControlSchema,
} from "../validators/qualityControl";
import multer from "multer";
import path from "path";

const router = Router();
const upload = multer({
  dest: path.join(__dirname, "../../uploads/certificates"),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Seuls les fichiers PDF sont autorisés."));
    }
    cb(null, true);
  },
});
// ✅ Appliquer le middleware de transformation
router.use(fullTransformation);

// Routes
router.get("/", QualityControlController.getQualityControls);
router.get("/:id", QualityControlController.getQualityControlById);
router.post(
  "/",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: createQualityControlSchema }),
  QualityControlController.createQualityControl
);
router.put(
  "/:id",
  requireRole("TECHNICIAN", "INSPECTOR", "ADMIN"),
  validateRequest({ body: updateQualityControlSchema }),
  QualityControlController.updateQualityControl
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  QualityControlController.deleteQualityControl
);

// Route upload certificat
// Route upload certificat
router.post(
  "/:id/certificate",
  requireRole("INSPECTOR", "ADMIN"),
  upload.single("certificate"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier n’a été téléchargé.",
        });
      }

      const filePath = `/uploads/certificates/${req.file.filename}`;

      const updated = await prisma.qualityControl.update({
        where: { id: parseInt(id) },
        data: { certificateUrl: filePath },
      });

      return res.json({ success: true, data: updated }); // ✅ ajout du return
    } catch (error) {
      next(error);
      return; // ✅ pour s'assurer qu'un chemin retourne toujours quelque chose
    }
  }
);

export default router;
