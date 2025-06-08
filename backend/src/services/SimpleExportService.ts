// Version simplifiée sans dépendances externes
export class SimpleExportService {
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
          lot.variety.name,
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
        variete: qc.seedLot.variety.name,
        dateControle: qc.controlDate,
        resultat: qc.result,
        tauxGermination: qc.germinationRate,
        purete: qc.varietyPurity,
        humidite: qc.moistureContent,
        sante: qc.seedHealth,
        observations: qc.observations,
        inspecteur: qc.inspector.name,
      })),
    };

    return JSON.stringify(report, null, 2);
  }

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
            <div class="stat-value">${data.summary.averageGerminationRate.toFixed(1)}%</div>
            <div class="stat-label">Germination moyenne</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${data.summary.averageVarietyPurity.toFixed(1)}%</div>
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
                    <td>${qc.seedLot.variety.name}</td>
                    <td>${new Date(qc.controlDate).toLocaleDateString("fr-FR")}</td>
                    <td class="${qc.result.toLowerCase()}">${qc.result === "PASS" ? "RÉUSSI" : "ÉCHEC"}</td>
                    <td>${qc.germinationRate}</td>
                    <td>${qc.varietyPurity}</td>
                    <td>${qc.inspector.name}</td>
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
}
