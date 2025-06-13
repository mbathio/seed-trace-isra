// backend/src/services/ExportService.ts - VERSION COMPLÈTE CORRIGÉE
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";

export class ExportService {
  // ✅ Export des lots de semences vers Excel
  static async exportSeedLotsToExcel(lots: any[]): Promise<Buffer> {
    const worksheet = XLSX.utils.json_to_sheet(
      lots.map((lot) => ({
        ID: lot.id,
        Variété: lot.variety?.name || "N/A",
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

  // ✅ Export des lots de semences vers CSV
  static async exportSeedLotsToCSV(lots: any[]): Promise<string> {
    const headers = [
      "ID",
      "Variété",
      "Niveau",
      "Quantité",
      "Date de production",
      "Statut",
      "Multiplicateur",
      "Notes",
    ];

    const csvRows = [
      headers.join(","),
      ...lots.map((lot) =>
        [
          lot.id,
          lot.variety?.name || "N/A",
          lot.level,
          lot.quantity,
          lot.productionDate,
          lot.status,
          lot.multiplier?.name || "N/A",
          `"${(lot.notes || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];

    return csvRows.join("\n");
  }

  // ✅ Export du rapport de qualité vers PDF
  static async exportQualityReportToPDF(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
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
          `Taux de germination moyen: ${data.summary.averageGerminationRate.toFixed(
            1
          )}%`
        );

      doc.end();
    });
  }

  // ✅ Export du rapport de qualité vers JSON
  static async exportQualityReportToJSON(data: any): Promise<string> {
    const report = {
      titre: "Rapport de contrôle qualité",
      dateGeneration: new Date().toISOString(),
      statistiques: {
        totalControles: data.statistics.totalControls,
        tauxReussite: data.summary.passRate,
        tauxGerminationMoyen: data.summary.averageGerminationRate,
        pureteMoyenne: data.summary.averageVarietyPurity,
      },
      controles: data.qualityControls.map((qc: any) => ({
        id: qc.id,
        lotId: qc.lotId,
        variete: qc.seedLot?.variety?.name,
        dateControle: qc.controlDate,
        resultat: qc.result,
        tauxGermination: qc.germinationRate,
        purete: qc.varietyPurity,
        humidite: qc.moistureContent,
        sante: qc.seedHealth,
        observations: qc.observations,
        inspecteur: qc.inspector?.name,
      })),
    };

    return JSON.stringify(report, null, 2);
  }

  // ✅ Générer le rapport HTML
  static generateReportHTML(data: any): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Contrôle Qualité - ISRA</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #2c5530; margin-bottom: 30px; }
        .stats { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .stat-item { display: inline-block; margin: 10px 20px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2c5530; }
        .stat-label { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #2c5530; color: white; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌾 RAPPORT DE CONTRÔLE QUALITÉ</h1>
        <h2>Institut Sénégalais de Recherches Agricoles (ISRA)</h2>
        <p>Généré le : ${new Date().toLocaleDateString("fr-FR")}</p>
    </div>

    <div class="stats">
        <div class="stat-item">
            <div class="stat-value">${data.statistics.totalControls}</div>
            <div class="stat-label">Total contrôles</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${data.summary.passRate.toFixed(1)}%</div>
            <div class="stat-label">Taux de réussite</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${data.summary.averageGerminationRate.toFixed(
              1
            )}%</div>
            <div class="stat-label">Germination moyenne</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${data.summary.averageVarietyPurity.toFixed(
              1
            )}%</div>
            <div class="stat-label">Pureté moyenne</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Lot ID</th>
                <th>Variété</th>
                <th>Date</th>
                <th>Résultat</th>
                <th>Germination (%)</th>
                <th>Pureté (%)</th>
                <th>Inspecteur</th>
            </tr>
        </thead>
        <tbody>
            ${data.qualityControls
              .map(
                (qc: any) => `
                <tr>
                    <td>${qc.lotId}</td>
                    <td>${qc.seedLot?.variety?.name || "N/A"}</td>
                    <td>${new Date(qc.controlDate).toLocaleDateString(
                      "fr-FR"
                    )}</td>
                    <td class="${qc.result.toLowerCase()}">${
                  qc.result === "PASS" ? "RÉUSSI" : "ÉCHEC"
                }</td>
                    <td>${qc.germinationRate}</td>
                    <td>${qc.varietyPurity}</td>
                    <td>${qc.inspector?.name || "N/A"}</td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table>
</body>
</html>
    `;
  }

  // ✅ Générer un nom de fichier avec timestamp
  static generateFilename(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${prefix}_${timestamp}.${extension}`;
  }

  // ✅ Obtenir le type MIME selon l'extension
  static getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      csv: "text/csv",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      json: "application/json",
      pdf: "application/pdf",
      html: "text/html",
    };
    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
  }
}
