// backend/src/utils/validation.ts
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+221)?[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  static isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, "");
  }

  static isValidSeedLevel(level: string): boolean {
    const validLevels = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
    return validLevels.includes(level);
  }

  static isValidCropType(cropType: string): boolean {
    const validTypes = [
      "rice",
      "maize",
      "peanut",
      "sorghum",
      "cowpea",
      "millet",
    ];
    return validTypes.includes(cropType);
  }
}
