// backend/src/config/environment.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || "development",

  server: {
    port: parseInt(process.env.PORT || "3001"),
    host: process.env.HOST || "localhost",
  },

  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://user1:user1@localhost:5432/isra_seeds",
  },

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production-please",
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  client: {
    url: process.env.CLIENT_URL || "http://localhost:5173",
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"),
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
    allowedFormats: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "jpg",
      "jpeg",
      "png",
    ],
  },

  qrCode: {
    baseUrl:
      process.env.QR_BASE_URL || "https://api.qrserver.com/v1/create-qr-code/",
  },
};
