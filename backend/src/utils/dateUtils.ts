// backend/src/utils/dateUtils.ts
export class DateUtils {
  static formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  static isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  static daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }

  static getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) {
      return "Hivernage";
    } else if (month >= 11 || month <= 2) {
      return "Saison sèche froide";
    } else {
      return "Saison sèche chaude";
    }
  }
}
