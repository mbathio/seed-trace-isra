// backend/src/services/ExportService.ts - VERSION COMPLÈTE CORRIGÉE
import * as ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export class ExportService {
  // ✅ Export des lots de semences vers Excel
  static async exportSeedLotsToExcel(lots: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Lots de semences");

    // Définir les colonnes
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Variété", key: "variety", width: 20 },
      { header: "Niveau", key: "level", width: 10 },
      { header: "Quantité", key: "quantity", width: 15 },
      { header: "Date de production", key: "productionDate", width: 20 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Multiplicateur", key: "multiplier", width: 25 },
      { header: "Notes", key: "notes", width: 40 },
    ];

    // Ajouter les données
    lots.forEach((lot) => {
      worksheet.addRow({
        id: lot.id,
        variety: lot.variety?.name || "N/A",
        level: lot.level,
        quantity: lot.quantity,
        productionDate: lot.productionDate,
        status: lot.status,
        multiplier: lot.multiplier?.name || "N/A",
        notes: lot.notes || "",
      });
    });

    // Style d'en-tête
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Générer le buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
