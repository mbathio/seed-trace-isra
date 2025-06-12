// src/services/ExportService.ts
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";

export class ExportService {
  static async exportSeedLotsToExcel(
    lots: any[],
    filename: string = "lots_semences.xlsx"
  ): Promise<Buffer> {
    const worksheet = XLSX.utils.json_to_sheet(
      lots.map((lot) => ({
        ID: lot.id,
        Variété: lot.variety.name,
        Niveau: lot.level,
        Quantité: lot.quantity,
        "Date de production": lot.productionDate,
        Statut: lot.status,
        Multiplicateur: lot.multiplier?.name || "N/A",
        Notes: lot.notes || "",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lots de semences");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }

  static async exportQualityReportToPDF(
    data: any,
    filename: string = "rapport_qualite.pdf"
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // En-tête
      doc.fontSize(20).text("RAPPORT DE CONTRÔLE QUALITÉ", { align: "center" });
      doc.moveDown();

      // Statistiques générales
      doc.fontSize(14).text("Statistiques générales:", { underline: true });
      doc
        .fontSize(10)
        .text(`Nombre total de contrôles: ${data.statistics.totalControls}`)
        .text(`Taux de réussite: ${data.summary.passRate.toFixed(1)}%`)
        .text(
          `Taux de germination moyen: ${data.summary.averageGerminationRate.toFixed(1)}%`
        );

      doc.end();
    });
  }
}
