export class IdGenerator {
  static generateLotId(
    level: string,
    year?: number,
    sequence?: number
  ): string {
    const currentYear = year || new Date().getFullYear();

    // Utiliser une séquence si fournie, sinon générer aléatoirement
    const seqNumber = sequence || Math.floor(Math.random() * 1000);
    const seqString = seqNumber.toString().padStart(3, "0");

    return `SL-${level}-${currentYear}-${seqString}`;
  }

  static generateBatchNumber(varietyCode: string, date: Date): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${varietyCode.toUpperCase()}-${year}${month}${day}`;
  }

  static generateReportId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `RPT-${timestamp}-${random}`;
  }
}
