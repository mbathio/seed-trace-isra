// backend/src/utils/fileUpload.ts
import multer from "multer";
import path from "path";
import { config } from "../config/environment";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedFormats = config.upload.allowedFormats;
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);

  if (allowedFormats.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Format de fichier non autorisé. Formats autorisés: ${allowedFormats.join(", ")}`
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});
