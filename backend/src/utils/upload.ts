// backend/src/utils/uploads.ts
import multer from "multer";
import fs from "fs";
import path from "path";

const baseDir = path.join(process.cwd(), "storage", "certificates");
fs.mkdirSync(baseDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, baseDir),
  filename: (_req, file, cb) => {
    // nom: qc-<id>-<timestamp>.pdf
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `qc-${Date.now()}${ext}`);
  },
});

export const uploadCertificate = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Seuls les PDF sont autorisés"));
    }
    cb(null, true);
  },
});
