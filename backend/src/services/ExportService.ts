// backend/src/services/ExportService.ts
import { prisma } from "../config/database";
import { logger } from "../utils/logger";
import { SimpleExportService } from "./SimpleExportService";
import { GenealogyService } from "./GenealogyService";
import { QualityControlService } from "./QualityControlService";
import QRCode from "qrcode";
import archiver from "archiver";
import { Readable } from "stream";

export class ExportService {
  /**
   * Retourne les formats d'export disponibles
   */
  static getAvailableFormats() {
    return {
      seedLots: ["csv", "xlsx", "json"],
      qualityReport: ["html", "pdf", "json", "xlsx"],
      productionStats: ["xlsx", "csv", "json"],
      genealogy: ["json", "pdf", "dot"],
      certificates: ["pdf", "html"],
      general: ["csv", "xlsx", "json", "xml"],
    };
  }

  /**
   * Export des lots de semences
   */
  static async exportSeedLots(filters: any, format: string): Promise<any> {
    try {
      // Récupérer les lots selon les filtres
      const where: any = { isActive: true };

      if (filters.level) where.level = filters.level;
      if (filters.status) where.status = filters.status;
      if (filters.varietyId) where.varietyId = parseInt(filters.varietyId);
      if (filters.multiplierId)
        where.multiplierId = parseInt(filters.multiplierId);

      if (filters.startDate || filters.endDate) {
        where.productionDate = {};
        if (filters.startDate)
          where.productionDate.gte = new Date(filters.startDate);
        if (filters.endDate)
          where.productionDate.lte = new Date(filters.endDate);
      }

      const seedLots = await prisma.seedLot.findMany({
        where,
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          qualityControls: {
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
        orderBy: { productionDate: "desc" },
      });

      // Formater selon le format demandé
      switch (format) {
        case "csv":
          return this.exportSeedLotsToCSV(seedLots);
        case "xlsx":
          return this.exportSeedLotsToExcel(seedLots);
        case "json":
          return JSON.stringify(seedLots, null, 2);
        default:
          throw new Error(`Format non supporté: ${format}`);
      }
    } catch (error) {
      logger.error("Erreur export seed lots:", error);
      throw error;
    }
  }

  /**
   * Export du rapport de contrôle qualité
   */
  static async exportQualityReport(filters: any, format: string): Promise<any> {
    try {
      const report = await QualityControlService.generateQualityReport(filters);

      switch (format) {
        case "html":
          return SimpleExportService.generateReportHTML(report);
        case "json":
          return SimpleExportService.exportQualityReportToJSON(report);
        case "xlsx":
          return this.exportQualityReportToExcel(report);
        case "pdf":
          // TODO: Implémenter la génération PDF
          throw new Error("Export PDF non encore implémenté");
        default:
          throw new Error(`Format non supporté: ${format}`);
      }
    } catch (error) {
      logger.error("Erreur export quality report:", error);
      throw error;
    }
  }

  /**
   * Export des statistiques de production
   */
  static async exportProductionStats(
    filters: any,
    format: string
  ): Promise<any> {
    try {
      const stats = await this.generateProductionStats(filters);

      switch (format) {
        case "xlsx":
          return this.exportProductionStatsToExcel(stats);
        case "csv":
          return this.exportProductionStatsToCSV(stats);
        case "json":
          return JSON.stringify(stats, null, 2);
        default:
          throw new Error(`Format non supporté: ${format}`);
      }
    } catch (error) {
      logger.error("Erreur export production stats:", error);
      throw error;
    }
  }

  /**
   * Export personnalisé
   */
  static async customExport(params: {
    entityType: string;
    format: string;
    fields?: string[];
    filters?: any;
    includeRelations?: boolean;
  }): Promise<any> {
    try {
      const { entityType, format, fields, filters, includeRelations } = params;

      // Mapping des entités
      const entityMap: Record<string, any> = {
        seedLots: prisma.seedLot,
        varieties: prisma.variety,
        multipliers: prisma.multiplier,
        parcels: prisma.parcel,
        productions: prisma.production,
        qualityControls: prisma.qualityControl,
      };

      const model = entityMap[entityType];
      if (!model) {
        throw new Error(`Type d'entité non supporté: ${entityType}`);
      }

      // Construire la requête
      const query: any = { where: filters || {} };

      // Sélectionner uniquement les champs demandés
      if (fields && fields.length > 0) {
        query.select = fields.reduce(
          (acc, field) => ({ ...acc, [field]: true }),
          {}
        );
      }

      // Inclure les relations si demandé
      if (includeRelations) {
        query.include = this.getDefaultIncludes(entityType);
      }

      const data = await model.findMany(query);

      // Formater selon le format demandé
      switch (format) {
        case "csv":
          return this.dataToCSV(data, fields);
        case "xlsx":
          return this.dataToExcel(data, entityType);
        case "json":
          return JSON.stringify(data, null, 2);
        case "xml":
          return this.dataToXML(data, entityType);
        default:
          throw new Error(`Format non supporté: ${format}`);
      }
    } catch (error) {
      logger.error("Erreur custom export:", error);
      throw error;
    }
  }

  /**
   * Génère un modèle d'import
   */
  static async generateImportTemplate(
    type: string,
    format: string
  ): Promise<any> {
    const templates: Record<string, any> = {
      seedLots: {
        headers: [
          "varietyCode",
          "level",
          "quantity",
          "productionDate",
          "expiryDate",
          "multiplierEmail",
          "parcelName",
          "parentLotId",
          "notes",
        ],
        sample: {
          varietyCode: "SAHEL-108",
          level: "G1",
          quantity: 500,
          productionDate: "2024-01-15",
          expiryDate: "2026-01-15",
          multiplierEmail: "station.fanaye@isra.sn",
          parcelName: "Bande 1",
          parentLotId: "SL-GO-2024-001",
          notes: "Production hivernage 2024",
        },
      },
      varieties: {
        headers: [
          "code",
          "name",
          "cropType",
          "description",
          "maturityDays",
          "yieldPotential",
          "resistances",
          "origin",
          "releaseYear",
        ],
        sample: {
          code: "ISRIZ-20",
          name: "ISRIZ 20",
          cropType: "RICE",
          description: "Variété améliorée de riz",
          maturityDays: 120,
          yieldPotential: 8.5,
          resistances: "Blast,Pyriculariose",
          origin: "ISRA",
          releaseYear: 2024,
        },
      },
      multipliers: {
        headers: [
          "name",
          "address",
          "latitude",
          "longitude",
          "yearsExperience",
          "certificationLevel",
          "specialization",
          "phone",
          "email",
        ],
        sample: {
          name: "Coopérative Agricole Fanaye",
          address: "Fanaye, Saint-Louis, Sénégal",
          latitude: 16.5667,
          longitude: -15.1333,
          yearsExperience: 10,
          certificationLevel: "INTERMEDIATE",
          specialization: "RICE,WHEAT",
          phone: "771234567",
          email: "coop.fanaye@email.sn",
        },
      },
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Type de modèle non supporté: ${type}`);
    }

    if (format === "csv") {
      const rows = [
        template.headers.join(","),
        Object.values(template.sample).join(","),
      ];
      return rows.join("\n");
    } else {
      // Format Excel
      return this.createExcelTemplate(template);
    }
  }

  /**
   * Export de l'arbre généalogique
   */
  static async exportGenealogy(lotId: string, format: string): Promise<any> {
    try {
      return await GenealogyService.exportGenealogy(
        lotId,
        format as "json" | "csv" | "dot"
      );
    } catch (error) {
      logger.error("Erreur export genealogy:", error);
      throw error;
    }
  }

  /**
   * Export en masse
   */
  static async bulkExport(
    exports: Array<{
      type: string;
      format: string;
      filters?: any;
    }>
  ): Promise<Buffer> {
    try {
      // Créer une archive ZIP
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on("data", (chunk) => chunks.push(chunk));

      // Traiter chaque export
      for (const [index, exportConfig] of exports.entries()) {
        const { type, format, filters } = exportConfig;
        let data: any;
        let filename: string;

        switch (type) {
          case "seedLots":
            data = await this.exportSeedLots(filters || {}, format);
            filename = `lots-semences-${index + 1}.${format}`;
            break;
          case "qualityReport":
            data = await this.exportQualityReport(filters || {}, format);
            filename = `rapport-qualite-${index + 1}.${format}`;
            break;
          case "productionStats":
            data = await this.exportProductionStats(filters || {}, format);
            filename = `stats-production-${index + 1}.${format}`;
            break;
          default:
            continue;
        }

        // Ajouter à l'archive
        archive.append(data, { name: filename });
      }

      await archive.finalize();

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error("Erreur bulk export:", error);
      throw error;
    }
  }

  /**
   * Génère un certificat pour un lot
   */
  static async generateCertificate(
    lotId: string,
    options: {
      format: string;
      language: string;
    }
  ): Promise<any> {
    try {
      const seedLot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: {
          variety: true,
          multiplier: true,
          parcel: true,
          qualityControls: {
            where: { result: "PASS" },
            orderBy: { controlDate: "desc" },
            take: 1,
          },
        },
      });

      if (!seedLot) {
        throw new Error("Lot non trouvé");
      }

      if (!seedLot.qualityControls.length) {
        throw new Error("Aucun contrôle qualité réussi pour ce lot");
      }

      const certificate = {
        certificateNumber: `CERT-${lotId}-${Date.now()}`,
        issuedDate: new Date(),
        lot: {
          id: seedLot.id,
          variety: seedLot.variety.name,
          level: seedLot.level,
          quantity: seedLot.quantity,
          productionDate: seedLot.productionDate,
        },
        multiplier: seedLot.multiplier,
        qualityControl: seedLot.qualityControls[0],
        issuer: {
          name: "Institut Sénégalais de Recherches Agricoles",
          acronym: "ISRA",
          address: "Dakar, Sénégal",
        },
      };

      if (options.format === "html") {
        return this.generateCertificateHTML(certificate, options.language);
      } else {
        // TODO: Implémenter la génération PDF
        throw new Error("Export PDF non encore implémenté");
      }
    } catch (error) {
      logger.error("Erreur génération certificat:", error);
      throw error;
    }
  }

  /**
   * Génère des étiquettes QR
   */
  static async generateQRLabels(
    lotId: string,
    quantity: number,
    format: string
  ): Promise<any> {
    try {
      const seedLot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: {
          variety: true,
          multiplier: true,
        },
      });

      if (!seedLot) {
        throw new Error("Lot non trouvé");
      }

      const qrData = {
        id: seedLot.id,
        variety: seedLot.variety.code,
        level: seedLot.level,
        quantity: seedLot.quantity,
        productionDate: seedLot.productionDate,
        multiplier: seedLot.multiplier?.name,
      };

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
      });

      if (format === "png") {
        // Retourner l'image PNG directement
        const base64Data = qrCodeDataUrl.replace(
          /^data:image\/png;base64,/,
          ""
        );
        return Buffer.from(base64Data, "base64");
      } else {
        // TODO: Générer PDF avec plusieurs étiquettes
        throw new Error("Export PDF d'étiquettes non encore implémenté");
      }
    } catch (error) {
      logger.error("Erreur génération étiquettes QR:", error);
      throw error;
    }
  }

  // === Méthodes utilitaires privées ===

  private static exportSeedLotsToCSV(seedLots: any[]): string {
    const headers = [
      "ID",
      "Variété",
      "Code Variété",
      "Niveau",
      "Quantité (kg)",
      "Date Production",
      "Date Expiration",
      "Statut",
      "Multiplicateur",
      "Parcelle",
      "Germination (%)",
      "Pureté (%)",
      "Notes",
    ];

    const rows = seedLots.map((lot) => {
      const lastQC = lot.qualityControls[0];
      return [
        lot.id,
        lot.variety.name,
        lot.variety.code,
        lot.level,
        lot.quantity,
        new Date(lot.productionDate).toLocaleDateString("fr-FR"),
        lot.expiryDate
          ? new Date(lot.expiryDate).toLocaleDateString("fr-FR")
          : "",
        lot.status,
        lot.multiplier?.name || "",
        lot.parcel?.name || "",
        lastQC?.germinationRate || "",
        lastQC?.varietyPurity || "",
        `"${(lot.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  private static async exportSeedLotsToExcel(seedLots: any[]): Promise<Buffer> {
    // Utiliser SimpleExportService pour l'instant
    const csv = this.exportSeedLotsToCSV(seedLots);
    return Buffer.from(csv, "utf-8");
  }

  private static async generateProductionStats(filters: any): Promise<any> {
    const { year, multiplierId, varietyId, status } = filters;

    const where: any = {};
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.startDate = { gte: startDate, lte: endDate };
    }
    if (multiplierId) where.multiplierId = parseInt(multiplierId);
    if (status) where.status = status;

    const productions = await prisma.production.findMany({
      where,
      include: {
        seedLot: {
          include: { variety: true },
        },
        multiplier: true,
        parcel: true,
      },
    });

    // Calculer les statistiques
    const stats = {
      totalProductions: productions.length,
      byStatus: this.groupByField(productions, "status"),
      byVariety: this.groupProductionsByVariety(productions),
      byMultiplier: this.groupByMultiplier(productions),
      byMonth: this.groupByMonth(productions),
      totalYield: productions.reduce(
        (sum: number, p: any) => sum + (p.actualYield || 0),
        0
      ),
    };

    return { productions, stats };
  }

  private static exportProductionStatsToCSV(data: any): string {
    const { productions, stats } = data;

    // Section statistiques
    const statsSection = [
      "STATISTIQUES DE PRODUCTION",
      "",
      `Total productions: ${stats.totalProductions}`,
      `Rendement total: ${stats.totalYield} kg`,
      "",
      "PAR STATUT:",
      ...Object.entries(stats.byStatus).map(
        ([status, count]) => `${status}: ${count}`
      ),
      "",
    ];

    // Section détails
    const headers = [
      "ID Production",
      "Lot",
      "Variété",
      "Multiplicateur",
      "Parcelle",
      "Date Début",
      "Date Fin",
      "Statut",
      "Rendement (kg)",
    ];

    const rows = productions.map((prod: any) =>
      [
        prod.id,
        prod.seedLot.id,
        prod.seedLot.variety.name,
        prod.multiplier.name,
        prod.parcel.name || "",
        new Date(prod.startDate).toLocaleDateString("fr-FR"),
        prod.endDate ? new Date(prod.endDate).toLocaleDateString("fr-FR") : "",
        prod.status,
        prod.actualYield || "",
      ].join(",")
    );

    return [...statsSection, "", headers.join(","), ...rows].join("\n");
  }

  private static async exportProductionStatsToExcel(
    data: any
  ): Promise<Buffer> {
    // Utiliser CSV pour l'instant
    const csv = this.exportProductionStatsToCSV(data);
    return Buffer.from(csv, "utf-8");
  }

  private static async exportQualityReportToExcel(
    report: any
  ): Promise<Buffer> {
    // Utiliser JSON pour l'instant
    return Buffer.from(JSON.stringify(report, null, 2), "utf-8");
  }

  private static dataToCSV(data: any[], fields?: string[]): string {
    if (!data.length) return "";

    const headers = fields || Object.keys(data[0]);
    const rows = data.map((item) =>
      headers
        .map((field) => {
          const value = item[field];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        })
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }

  private static async dataToExcel(
    data: any[],
    entityType: string
  ): Promise<Buffer> {
    // Utiliser CSV pour l'instant
    const csv = this.dataToCSV(data);
    return Buffer.from(csv, "utf-8");
  }

  private static dataToXML(data: any[], entityType: string): string {
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<${entityType}>`,
      ...data.map((item) => this.objectToXML(item, "item")),
      `</${entityType}>`,
    ];
    return xml.join("\n");
  }

  private static objectToXML(obj: any, tagName: string): string {
    const content = Object.entries(obj)
      .map(([key, value]) => {
        if (value === null || value === undefined) return "";
        if (typeof value === "object") {
          return this.objectToXML(value, key);
        }
        return `<${key}>${value}</${key}>`;
      })
      .join("\n  ");

    return `<${tagName}>\n  ${content}\n</${tagName}>`;
  }

  private static getDefaultIncludes(entityType: string): any {
    const includes: Record<string, any> = {
      seedLots: {
        variety: true,
        multiplier: true,
        parcel: true,
        qualityControls: { take: 1, orderBy: { controlDate: "desc" } },
      },
      varieties: {
        _count: { select: { seedLots: true } },
      },
      multipliers: {
        _count: { select: { seedLots: true, productions: true } },
      },
      parcels: {
        multiplier: true,
        _count: { select: { seedLots: true, productions: true } },
      },
      productions: {
        seedLot: { include: { variety: true } },
        multiplier: true,
        parcel: true,
      },
      qualityControls: {
        seedLot: { include: { variety: true } },
        inspector: true,
      },
    };

    return includes[entityType] || {};
  }

  private static async createExcelTemplate(template: any): Promise<Buffer> {
    // Pour l'instant, retourner un CSV
    const rows = [
      template.headers.join(","),
      Object.values(template.sample).join(","),
    ];
    return Buffer.from(rows.join("\n"), "utf-8");
  }

  private static generateCertificateHTML(
    certificate: any,
    language: string
  ): string {
    const translations: Record<string, any> = {
      fr: {
        title: "CERTIFICAT DE QUALITÉ DES SEMENCES",
        certNumber: "Numéro de certificat",
        issuedDate: "Date d'émission",
        variety: "Variété",
        level: "Niveau",
        quantity: "Quantité",
        productionDate: "Date de production",
        multiplier: "Multiplicateur",
        germination: "Taux de germination",
        purity: "Pureté variétale",
        moisture: "Taux d'humidité",
        health: "Santé des graines",
        certifies:
          "certifie que le lot de semences répond aux normes de qualité requises.",
      },
      en: {
        title: "SEED QUALITY CERTIFICATE",
        certNumber: "Certificate Number",
        issuedDate: "Issue Date",
        variety: "Variety",
        level: "Level",
        quantity: "Quantity",
        productionDate: "Production Date",
        multiplier: "Multiplier",
        germination: "Germination Rate",
        purity: "Varietal Purity",
        moisture: "Moisture Content",
        health: "Seed Health",
        certifies:
          "certifies that the seed lot meets the required quality standards.",
      },
    };

    const t = translations[language] || translations.fr;
    const qc = certificate.qualityControl;

    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <title>${t.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { width: 100px; height: 100px; }
        h1 { color: #2c5530; margin: 20px 0; }
        .certificate-info { margin: 20px 0; }
        .info-row { margin: 10px 0; display: flex; justify-content: space-between; }
        .label { font-weight: bold; }
        .section { margin: 30px 0; padding: 20px; background: #f5f5f5; }
        .signature { margin-top: 60px; text-align: right; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${t.title}</h1>
        <h2>${certificate.issuer.name}</h2>
        <p>${certificate.issuer.acronym}</p>
    </div>

    <div class="certificate-info">
        <div class="info-row">
            <span class="label">${t.certNumber}:</span>
            <span>${certificate.certificateNumber}</span>
        </div>
        <div class="info-row">
            <span class="label">${t.issuedDate}:</span>
            <span>${new Date(certificate.issuedDate).toLocaleDateString(
              language
            )}</span>
        </div>
    </div>

    <div class="section">
        <h3>Information du Lot</h3>
        <div class="info-row">
            <span class="label">ID:</span>
            <span>${certificate.lot.id}</span>
        </div>
        <div class="info-row">
            <span class="label">${t.variety}:</span>
            <span>${certificate.lot.variety}</span>
        </div>
        <div class="info-row">
            <span class="label">${t.level}:</span>
            <span>${certificate.lot.level}</span>
        </div>
        <div class="info-row">
            <span class="label">${t.quantity}:</span>
            <span>${certificate.lot.quantity} kg</span>
        </div>
        <div class="info-row">
            <span class="label">${t.productionDate}:</span>
            <span>${new Date(certificate.lot.productionDate).toLocaleDateString(
              language
            )}</span>
        </div>
    </div>

    <div class="section">
        <h3>${t.multiplier}</h3>
        <p>${certificate.multiplier.name}</p>
        <p>${certificate.multiplier.address}</p>
    </div>

    <div class="section">
        <h3>Résultats du Contrôle Qualité</h3>
        <div class="info-row">
            <span class="label">${t.germination}:</span>
            <span>${qc.germinationRate}%</span>
        </div>
        <div class="info-row">
            <span class="label">${t.purity}:</span>
            <span>${qc.varietyPurity}%</span>
        </div>
        ${
          qc.moistureContent
            ? `
        <div class="info-row">
            <span class="label">${t.moisture}:</span>
            <span>${qc.moistureContent}%</span>
        </div>`
            : ""
        }
        ${
          qc.seedHealth
            ? `
        <div class="info-row">
            <span class="label">${t.health}:</span>
            <span>${qc.seedHealth}%</span>
        </div>`
            : ""
        }
    </div>

    <p style="margin: 40px 0;">
        ${certificate.issuer.name} ${t.certifies}
    </p>

    <div class="signature">
        <p>_______________________</p>
        <p>Signature autorisée</p>
    </div>

    <div class="footer">
        <p>${certificate.issuer.address}</p>
    </div>
</body>
</html>
    `;
  }

  private static groupByField(
    items: any[],
    field: string
  ): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  private static groupProductionsByVariety(
    productions: any[]
  ): Record<string, any> {
    const groups: Record<string, any> = {};

    productions.forEach((prod) => {
      const varietyName = prod.seedLot.variety.name;
      if (!groups[varietyName]) {
        groups[varietyName] = {
          count: 0,
          totalYield: 0,
        };
      }
      groups[varietyName].count++;
      groups[varietyName].totalYield += prod.actualYield || 0;
    });

    return groups;
  }

  private static groupByMultiplier(productions: any[]): Record<string, any> {
    const groups: Record<string, any> = {};

    productions.forEach((prod) => {
      const multiplierName = prod.multiplier.name;
      if (!groups[multiplierName]) {
        groups[multiplierName] = {
          count: 0,
          totalYield: 0,
        };
      }
      groups[multiplierName].count++;
      groups[multiplierName].totalYield += prod.actualYield || 0;
    });

    return groups;
  }

  private static groupByMonth(productions: any[]): Record<string, number> {
    const groups: Record<string, number> = {};

    productions.forEach((prod) => {
      const date = new Date(prod.startDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      groups[monthKey] = (groups[monthKey] || 0) + 1;
    });

    return groups;
  }
}
