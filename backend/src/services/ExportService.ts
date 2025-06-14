// backend/src/services/ExportService.ts - VERSION COMPLÈTE CORRIGÉE
// Note: Version sans dépendances externes pour éviter les erreurs

export class ExportService {
  // ✅ Export des lots de semences vers CSV
  static async exportSeedLotsToCSV(lots: any[]): Promise<string> {
    const headers = [
      "ID",
      "Variété",
      "Niveau",
      "Quantité (kg)",
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

  // ✅ Export des lots de semences vers Excel (format simple)
  static async exportSeedLotsToExcel(lots: any[]): Promise<Buffer> {
    // Version simplifiée qui retourne un CSV comme Excel
    const csv = await this.exportSeedLotsToCSV(lots);
    return Buffer.from(csv, "utf8");
  }

  // ✅ Export du rapport qualité en JSON
  static async exportQualityReportToJSON(data: any): Promise<string> {
    const report = {
      titre: "Rapport de contrôle qualité",
      dateGeneration: new Date().toISOString(),
      statistiques: data.statistics || {},
      resume: data.summary || {},
      controles: data.qualityControls || [],
    };

    return JSON.stringify(report, null, 2);
  }

  // ✅ Export du rapport qualité en PDF (format HTML pour l'instant)
  static async exportQualityReportToPDF(data: any): Promise<Buffer> {
    const html = this.generateReportHTML(data);
    return Buffer.from(html, "utf8");
  }

  // ✅ Générer un nom de fichier avec timestamp
  static generateFilename(prefix: string, extension: string): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    return `${prefix}_${timestamp}.${extension}`;
  }

  // ✅ Obtenir le type MIME selon l'extension
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      csv: "text/csv; charset=utf-8",
      json: "application/json",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pdf: "application/pdf",
      html: "text/html; charset=utf-8",
    };
    return mimeTypes[extension] || "application/octet-stream";
  }

  // ✅ Générer un rapport HTML
  static generateReportHTML(data: any): string {
    const stats = data.statistics || {};
    const summary = data.summary || {};
    const controls = data.qualityControls || [];

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Contrôle Qualité - ISRA</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
        }
        .header { 
            text-align: center; 
            color: #2c5530; 
            margin-bottom: 30px;
            border-bottom: 2px solid #2c5530;
            padding-bottom: 20px;
        }
        .stats { 
            background: #f5f5f5; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }
        .stat-item { 
            text-align: center;
            margin: 10px 20px;
            min-width: 150px;
        }
        .stat-value { 
            font-size: 36px; 
            font-weight: bold; 
            color: #2c5530;
            display: block;
            margin-bottom: 5px;
        }
        .stat-label { 
            font-size: 14px; 
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #2c5530; 
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .pass { 
            color: #28a745; 
            font-weight: bold; 
        }
        .fail { 
            color: #dc3545; 
            font-weight: bold; 
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌾 RAPPORT DE CONTRÔLE QUALITÉ</h1>
        <h2>Institut Sénégalais de Recherches Agricoles (ISRA)</h2>
        <p>Station de Fanaye - Saint-Louis</p>
        <p><strong>Date de génération :</strong> ${new Date().toLocaleDateString(
          "fr-FR",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}</p>
    </div>

    <div class="stats">
        <div class="stat-item">
            <span class="stat-value">${stats.totalControls || 0}</span>
            <span class="stat-label">Contrôles Total</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${(summary.passRate || 0).toFixed(
              1
            )}%</span>
            <span class="stat-label">Taux de Réussite</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${(
              summary.averageGerminationRate || 0
            ).toFixed(1)}%</span>
            <span class="stat-label">Germination Moyenne</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${(
              summary.averageVarietyPurity || 0
            ).toFixed(1)}%</span>
            <span class="stat-label">Pureté Moyenne</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Lot ID</th>
                <th>Variété</th>
                <th>Date Contrôle</th>
                <th>Résultat</th>
                <th>Germination (%)</th>
                <th>Pureté (%)</th>
                <th>Humidité (%)</th>
                <th>Inspecteur</th>
            </tr>
        </thead>
        <tbody>
            ${controls
              .map(
                (qc: any) => `
                <tr>
                    <td>${qc.lotId}</td>
                    <td>${qc.seedLot?.variety?.name || "N/A"}</td>
                    <td>${new Date(qc.controlDate).toLocaleDateString(
                      "fr-FR"
                    )}</td>
                    <td class="${qc.result.toLowerCase()}">${
                  qc.result === "PASS" ? "✓ RÉUSSI" : "✗ ÉCHEC"
                }</td>
                    <td>${qc.germinationRate.toFixed(1)}</td>
                    <td>${qc.varietyPurity.toFixed(1)}</td>
                    <td>${
                      qc.moistureContent ? qc.moistureContent.toFixed(1) : "N/A"
                    }</td>
                    <td>${qc.inspector?.name || "N/A"}</td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table>

    <div class="footer">
        <p>© ${new Date().getFullYear()} ISRA - Institut Sénégalais de Recherches Agricoles</p>
        <p>Ce rapport est généré automatiquement par le système de traçabilité des semences</p>
    </div>
</body>
</html>
    `;
  }
}
