// backend/src/services/ExportService.ts - Service d'export unifié et corrigé
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { logger } from "../utils/logger";

export interface ExportOptions {
  format: "csv" | "xlsx" | "pdf" | "json" | "html";
  filename?: string;
  title?: string;
}

export class ExportService {
  // ✅ Export CSV simple et rapide
  static async exportSeedLotsToCSV(lots: any[]): Promise<string> {
    try {
      const headers = [
        "ID",
        "Variété",
        "Niveau",
        "Quantité (kg)",
        "Date de production",
        "Statut",
        "Multiplicateur",
        "Parcelle",
        "Notes",
      ];

      const csvRows = [
        headers.join(","),
        ...lots.map((lot) =>
          [
            lot.id || "",
            (lot.variety?.name || "").replace(/"/g, '""'),
            lot.level || "",
            lot.quantity || 0,
            lot.productionDate
              ? new Date(lot.productionDate).toLocaleDateString("fr-FR")
              : "",
            lot.status || "",
            (lot.multiplier?.name || "N/A").replace(/"/g, '""'),
            (lot.parcel?.name || "N/A").replace(/"/g, '""'),
            `"${(lot.notes || "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ];

      return csvRows.join("\n");
    } catch (error) {
      logger.error("Erreur lors de l'export CSV:", error);
      throw new Error("Impossible de générer le fichier CSV");
    }
  }

  // ✅ Export Excel avec formatage
  static async exportSeedLotsToExcel(
    lots: any[],
    filename: string = "lots_semences.xlsx"
  ): Promise<Buffer> {
    try {
      const workbook = XLSX.utils.book_new();

      // Données formatées pour Excel
      const excelData = lots.map((lot) => ({
        ID: lot.id || "",
        Variété: lot.variety?.name || "",
        "Code Variété": lot.variety?.code || "",
        Niveau: lot.level || "",
        "Quantité (kg)": lot.quantity || 0,
        "Date de production": lot.productionDate
          ? new Date(lot.productionDate).toLocaleDateString("fr-FR")
          : "",
        "Date d'expiration": lot.expiryDate
          ? new Date(lot.expiryDate).toLocaleDateString("fr-FR")
          : "",
        Statut: lot.status || "",
        Multiplicateur: lot.multiplier?.name || "N/A",
        Parcelle: lot.parcel?.name || "N/A",
        "Surface (ha)": lot.parcel?.area || "",
        "Dernière QC": lot.qualityControls?.[0]?.result || "N/A",
        Notes: lot.notes || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Ajuster la largeur des colonnes
      const columnWidths = [
        { wch: 15 }, // ID
        { wch: 20 }, // Variété
        { wch: 12 }, // Code
        { wch: 8 }, // Niveau
        { wch: 12 }, // Quantité
        { wch: 15 }, // Date prod
        { wch: 15 }, // Date exp
        { wch: 12 }, // Statut
        { wch: 20 }, // Multiplicateur
        { wch: 15 }, // Parcelle
        { wch: 10 }, // Surface
        { wch: 10 }, // QC
        { wch: 30 }, // Notes
      ];
      worksheet["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Lots de semences");

      // Ajouter une feuille de statistiques
      const statsData = [
        { Métrique: "Total des lots", Valeur: lots.length },
        {
          Métrique: "Quantité totale (kg)",
          Valeur: lots.reduce((sum, lot) => sum + (lot.quantity || 0), 0),
        },
        {
          Métrique: "Lots certifiés",
          Valeur: lots.filter((lot) => lot.status === "CERTIFIED").length,
        },
        {
          Métrique: "Lots en attente",
          Valeur: lots.filter((lot) => lot.status === "PENDING").length,
        },
      ];

      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, "Statistiques");

      return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    } catch (error) {
      logger.error("Erreur lors de l'export Excel:", error);
      throw new Error("Impossible de générer le fichier Excel");
    }
  }

  // ✅ Export PDF avec mise en forme
  static async exportQualityReportToPDF(
    data: any,
    filename: string = "rapport_qualite.pdf"
  ): Promise<Buffer> {
    try {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // En-tête du document
        doc
          .fontSize(20)
          .fillColor("#2c5530")
          .text("🌾 RAPPORT DE CONTRÔLE QUALITÉ", { align: "center" });

        doc
          .fontSize(16)
          .fillColor("#333")
          .text("Institut Sénégalais de Recherches Agricoles (ISRA)", {
            align: "center",
          });

        doc
          .fontSize(12)
          .text(`Généré le : ${new Date().toLocaleDateString("fr-FR")}`, {
            align: "center",
          });

        doc.moveDown(2);

        // Section statistiques
        doc.fontSize(16).fillColor("#2c5530").text("📊 STATISTIQUES GÉNÉRALES");

        doc.moveDown(0.5);

        const stats = [
          [
            `Nombre total de contrôles:`,
            `${data.statistics?.totalControls || 0}`,
          ],
          [`Taux de réussite:`, `${(data.summary?.passRate || 0).toFixed(1)}%`],
          [
            `Taux de germination moyen:`,
            `${(data.summary?.averageGerminationRate || 0).toFixed(1)}%`,
          ],
          [
            `Pureté variétale moyenne:`,
            `${(data.summary?.averageVarietyPurity || 0).toFixed(1)}%`,
          ],
        ];

        stats.forEach(([label, value]) => {
          doc
            .fontSize(12)
            .fillColor("#333")
            .text(label, 70, doc.y, { continued: true })
            .fillColor("#2c5530")
            .text(` ${value}`, { align: "right" });
        });

        doc.moveDown(2);

        // Section détails (premiers 10 contrôles)
        doc.fontSize(16).fillColor("#2c5530").text("🔬 DÉTAILS DES CONTRÔLES");

        doc.moveDown(0.5);

        const controls = data.qualityControls?.slice(0, 10) || [];

        controls.forEach((qc: any, index: number) => {
          if (doc.y > 700) {
            // Nouvelle page si nécessaire
            doc.addPage();
          }

          doc
            .fontSize(12)
            .fillColor("#333")
            .text(`${index + 1}. Lot ${qc.lotId}`, 70)
            .text(`   Variété: ${qc.seedLot?.variety?.name || "N/A"}`)
            .text(
              `   Date: ${new Date(qc.controlDate).toLocaleDateString("fr-FR")}`
            )
            .text(
              `   Résultat: ${qc.result === "PASS" ? "✅ RÉUSSI" : "❌ ÉCHEC"}`
            )
            .text(
              `   Germination: ${qc.germinationRate}% | Pureté: ${qc.varietyPurity}%`
            )
            .text(`   Inspecteur: ${qc.inspector?.name || "N/A"}`);

          if (qc.observations) {
            doc.text(`   Observations: ${qc.observations}`);
          }

          doc.moveDown(0.5);
        });

        // Pied de page
        doc
          .fontSize(10)
          .fillColor("#666")
          .text(
            `Document généré automatiquement - ${new Date().toISOString()}`,
            50,
            doc.page.height - 50,
            {
              align: "center",
            }
          );

        doc.end();
      });
    } catch (error) {
      logger.error("Erreur lors de l'export PDF:", error);
      throw new Error("Impossible de générer le fichier PDF");
    }
  }

  // ✅ Export JSON structuré
  static async exportQualityReportToJSON(data: any): Promise<string> {
    try {
      const report = {
        metadata: {
          titre: "Rapport de contrôle qualité",
          dateGeneration: new Date().toISOString(),
          version: "1.0",
          source: "ISRA Seed Trace System",
        },
        statistiques: {
          totalControles: data.statistics?.totalControls || 0,
          tauxReussite: +(data.summary?.passRate || 0).toFixed(2),
          tauxGerminationMoyen: +(
            data.summary?.averageGerminationRate || 0
          ).toFixed(2),
          pureteMoyenne: +(data.summary?.averageVarietyPurity || 0).toFixed(2),
          controlesPasses: data.statistics?.passedControls || 0,
          controlesEchoues: data.statistics?.failedControls || 0,
        },
        controles: (data.qualityControls || []).map((qc: any) => ({
          id: qc.id,
          lotId: qc.lotId,
          variete: {
            nom: qc.seedLot?.variety?.name || "N/A",
            code: qc.seedLot?.variety?.code || "N/A",
            type: qc.seedLot?.variety?.cropType || "N/A",
          },
          multiplicateur: qc.seedLot?.multiplier?.name || "N/A",
          controle: {
            date: qc.controlDate,
            resultat: qc.result,
            tauxGermination: qc.germinationRate,
            purete: qc.varietyPurity,
            humidite: qc.moistureContent,
            sante: qc.seedHealth,
            methode: qc.testMethod || "Standard",
          },
          inspecteur: {
            nom: qc.inspector?.name || "N/A",
            email: qc.inspector?.email || "N/A",
          },
          observations: qc.observations || "",
        })),
      };

      return JSON.stringify(report, null, 2);
    } catch (error) {
      logger.error("Erreur lors de l'export JSON:", error);
      throw new Error("Impossible de générer le fichier JSON");
    }
  }

  // ✅ Export HTML avec style
  static generateReportHTML(data: any): string {
    try {
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f5f5f5;
            margin: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            color: #2c5530; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #2c5530; 
            padding-bottom: 20px;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header h2 { font-size: 1.3em; color: #666; margin-bottom: 10px; }
        .header p { color: #888; }
        
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .stat-card { 
            background: linear-gradient(135deg, #2c5530, #4a7c59); 
            color: white; 
            padding: 25px; 
            border-radius: 10px; 
            text-align: center; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .stat-value { 
            font-size: 3em; 
            font-weight: bold; 
            margin-bottom: 10px; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .stat-label { 
            font-size: 1.1em; 
            opacity: 0.9; 
        }
        
        .table-container { 
            margin-top: 40px; 
            overflow-x: auto;
        }
        .table-container h3 { 
            color: #2c5530; 
            margin-bottom: 20px; 
            font-size: 1.5em;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        th { 
            background: #2c5530; 
            color: white; 
            padding: 15px 10px; 
            text-align: left; 
            font-weight: 600;
        }
        td { 
            padding: 12px 10px; 
            border-bottom: 1px solid #eee; 
        }
        tr:hover { background-color: #f8f9fa; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        
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
            color: #666; 
            font-size: 0.9em;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }

        @media print {
            body { margin: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌾 RAPPORT DE CONTRÔLE QUALITÉ</h1>
            <h2>Institut Sénégalais de Recherches Agricoles (ISRA)</h2>
            <p>Généré le : ${new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalControls || 0}</div>
                <div class="stat-label">Total contrôles</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(summary.passRate || 0).toFixed(1)}%</div>
                <div class="stat-label">Taux de réussite</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(summary.averageGerminationRate || 0).toFixed(1)}%</div>
                <div class="stat-label">Germination moyenne</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(summary.averageVarietyPurity || 0).toFixed(1)}%</div>
                <div class="stat-label">Pureté moyenne</div>
            </div>
        </div>

        <div class="table-container">
            <h3>📋 Détails des contrôles qualité</h3>
            <table>
                <thead>
                    <tr>
                        <th>Lot ID</th>
                        <th>Variété</th>
                        <th>Date</th>
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
                            <td><strong>${qc.lotId}</strong></td>
                            <td>${qc.seedLot?.variety?.name || "N/A"}</td>
                            <td>${new Date(qc.controlDate).toLocaleDateString("fr-FR")}</td>
                            <td class="${qc.result === "PASS" ? "pass" : "fail"}">
                                ${qc.result === "PASS" ? "✅ RÉUSSI" : "❌ ÉCHEC"}
                            </td>
                            <td>${qc.germinationRate}%</td>
                            <td>${qc.varietyPurity}%</td>
                            <td>${qc.moistureContent || "N/A"}</td>
                            <td>${qc.inspector?.name || "N/A"}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Ce rapport a été généré automatiquement par le système de traçabilité des semences ISRA.</p>
            <p>Pour toute question, contactez l'équipe technique à l'adresse : <strong>support@isra.sn</strong></p>
        </div>
    </div>
</body>
</html>
      `;
    } catch (error) {
      logger.error("Erreur lors de la génération HTML:", error);
      throw new Error("Impossible de générer le fichier HTML");
    }
  }

  // ✅ Méthode utilitaire pour déterminer le type MIME
  static getMimeType(format: string): string {
    const mimeTypes: { [key: string]: string } = {
      csv: "text/csv",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pdf: "application/pdf",
      json: "application/json",
      html: "text/html",
    };
    return mimeTypes[format] || "application/octet-stream";
  }

  // ✅ Méthode utilitaire pour générer un nom de fichier
  static generateFilename(prefix: string, format: string): string {
    const timestamp = new Date().toISOString().split("T")[0];
    return `${prefix}_${timestamp}.${format}`;
  }
}
