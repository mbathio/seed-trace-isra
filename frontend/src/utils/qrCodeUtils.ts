// frontend/src/utils/qrCodeUtils.ts - Utilitaires pour QR Code
import QRCode from "qrcode";
import { SeedLot } from "../types/entities";

export interface QRCodeData {
  type: "SEED_LOT";
  id: string;
  variety: {
    name: string;
    code: string;
  };
  level: string;
  quantity: number;
  productionDate: string;
  status: string;
  multiplier?: string;
  batchNumber?: string;
  traceUrl: string;
  generatedAt: string;
}

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  color?: {
    dark: string;
    light: string;
  };
}

export class QRCodeService {
  private static readonly DEFAULT_OPTIONS: QRCodeOptions = {
    width: 400,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#2c5530", // Vert ISRA
      light: "#FFFFFF",
    },
  };

  /**
   * Génère les données à encoder dans le QR Code pour un lot de semences
   */
  static generateSeedLotData(seedLot: SeedLot): QRCodeData {
    return {
      type: "SEED_LOT",
      id: seedLot.id,
      variety: {
        name: seedLot.variety?.name || "Non spécifié",
        code: seedLot.variety?.code || "",
      },
      level: seedLot.level,
      quantity: seedLot.quantity,
      productionDate: seedLot.productionDate,
      status: seedLot.status,
      multiplier: seedLot.multiplier?.name || "",
      batchNumber: seedLot.batchNumber || "",
      traceUrl: `${window.location.origin}/trace/${seedLot.id}`,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Génère un QR Code sous forme de Data URL
   */
  static async generateQRCodeDataURL(
    data: QRCodeData,
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    try {
      const qrOptions = {
        ...this.DEFAULT_OPTIONS,
        ...options,
      };

      const dataString = JSON.stringify(data);

      console.log("Generating QR Code with data:", data);
      console.log("QR Code options:", qrOptions);

      const dataUrl = await QRCode.toDataURL(dataString, qrOptions);

      console.log("QR Code generated successfully");
      return dataUrl;
    } catch (error) {
      console.error("Erreur lors de la génération du QR Code:", error);
      throw new Error("Impossible de générer le QR Code");
    }
  }

  /**
   * Génère un QR Code pour un lot de semences
   */
  static async generateSeedLotQRCode(
    seedLot: SeedLot,
    options?: Partial<QRCodeOptions>
  ): Promise<string> {
    const data = this.generateSeedLotData(seedLot);
    return this.generateQRCodeDataURL(data, options);
  }

  /**
   * Valide les données d'un QR Code scanné
   */
  static validateQRCodeData(jsonString: string): QRCodeData | null {
    try {
      const data = JSON.parse(jsonString);

      // Vérifier la structure minimale
      if (
        data.type === "SEED_LOT" &&
        data.id &&
        data.variety &&
        data.level &&
        typeof data.quantity === "number"
      ) {
        return data as QRCodeData;
      }

      return null;
    } catch (error) {
      console.error("Erreur lors de la validation du QR Code:", error);
      return null;
    }
  }

  /**
   * Décode un QR Code et retourne les données du lot
   */
  static decodeQRCode(qrCodeString: string): QRCodeData | null {
    return this.validateQRCodeData(qrCodeString);
  }

  /**
   * Génère le nom de fichier pour le téléchargement
   */
  static generateFileName(
    seedLotId: string,
    format: "png" | "svg" = "png"
  ): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    return `qr-code-${seedLotId}-${timestamp}.${format}`;
  }

  /**
   * Télécharge le QR Code
   */
  static downloadQRCode(dataUrl: string, seedLotId: string): void {
    try {
      const link = document.createElement("a");
      link.download = this.generateFileName(seedLotId);
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      throw new Error("Impossible de télécharger le QR Code");
    }
  }

  /**
   * Génère le contenu HTML pour l'impression
   */
  static generatePrintContent(
    dataUrl: string,
    seedLot: SeedLot,
    includeDetails: boolean = true
  ): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat("fr-FR").format(num);
    };

    const getStatusLabel = (status: string) => {
      const statusLabels: Record<string, string> = {
        pending: "En attente",
        certified: "Certifié",
        rejected: "Rejeté",
        "in-stock": "En stock",
        active: "Actif",
        distributed: "Distribué",
        sold: "Vendu",
      };
      return statusLabels[status] || status;
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${seedLot.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              text-align: center;
            }
            .qr-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 2px solid #2c5530;
              border-radius: 8px;
            }
            .header {
              color: #2c5530;
              margin-bottom: 20px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .info {
              text-align: left;
              margin-top: 20px;
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              padding: 2px 0;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="header">
              <h1>🌾 ISRA - Système de Traçabilité</h1>
              <h2>Lot de Semences: ${seedLot.id}</h2>
            </div>
            
            <div class="qr-code">
              <img src="${dataUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />
            </div>
            
            ${
              includeDetails
                ? `
            <div class="info">
              <div class="info-row">
                <span class="label">Variété:</span>
                <span>${seedLot.variety?.name || "Non spécifié"} ${
                    seedLot.variety?.code ? `(${seedLot.variety.code})` : ""
                  }</span>
              </div>
              <div class="info-row">
                <span class="label">Niveau:</span>
                <span>${seedLot.level}</span>
              </div>
              <div class="info-row">
                <span class="label">Quantité:</span>
                <span>${formatNumber(seedLot.quantity)} kg</span>
              </div>
              <div class="info-row">
                <span class="label">Date de production:</span>
                <span>${formatDate(seedLot.productionDate)}</span>
              </div>
              <div class="info-row">
                <span class="label">Statut:</span>
                <span>${getStatusLabel(seedLot.status)}</span>
              </div>
              ${
                seedLot.multiplier
                  ? `
              <div class="info-row">
                <span class="label">Multiplicateur:</span>
                <span>${seedLot.multiplier.name}</span>
              </div>
              `
                  : ""
              }
              ${
                seedLot.batchNumber
                  ? `
              <div class="info-row">
                <span class="label">Numéro de lot:</span>
                <span>${seedLot.batchNumber}</span>
              </div>
              `
                  : ""
              }
            </div>
            `
                : ""
            }
            
            <div class="footer">
              <p>Scannez ce QR Code pour accéder à la traçabilité complète</p>
              <p>Généré le ${new Date().toLocaleString("fr-FR")}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Imprime le QR Code
   */
  static printQRCode(
    dataUrl: string,
    seedLot: SeedLot,
    includeDetails: boolean = true
  ): void {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error(
          "Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les pop-ups."
        );
      }

      const printContent = this.generatePrintContent(
        dataUrl,
        seedLot,
        includeDetails
      );

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.print();
      };
    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
      throw new Error("Impossible d'imprimer le QR Code");
    }
  }

  /**
   * Vérifie si la librairie QRCode est disponible
   */
  static isQRCodeLibraryAvailable(): boolean {
    try {
      return (
        typeof QRCode !== "undefined" && typeof QRCode.toDataURL === "function"
      );
    } catch {
      return false;
    }
  }

  /**
   * Génère un QR Code simple avec gestion d'erreur
   */
  static async generateSimpleQRCode(text: string): Promise<string> {
    if (!this.isQRCodeLibraryAvailable()) {
      throw new Error("La librairie QR Code n'est pas disponible");
    }

    try {
      return await QRCode.toDataURL(text, this.DEFAULT_OPTIONS);
    } catch (error) {
      console.error("Erreur lors de la génération du QR Code simple:", error);
      throw new Error("Impossible de générer le QR Code");
    }
  }
}

// Export des types et de la classe
export default QRCodeService;
