// backend/src/types/multer.d.ts - Types Multer spécifiques
declare module "express" {
  interface Request {
    file?: Express.Multer.File;
    files?:
      | Express.Multer.File[]
      | { [fieldname: string]: Express.Multer.File[] };
  }
}
