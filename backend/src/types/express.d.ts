import { AuthenticatedRequest } from "../middleware/auth";

declare global {
  namespace Express {
    interface Request {
      parsedQuery: {
        page: number;
        pageSize: number;
        search?: string;
        [key: string]: any;
      };
      user?: {
        userId: number;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
      };
    }

    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}
