// backend/src/utils/qrCode.ts (corrigé)
import QRCode from "qrcode";
import { config } from "../config/environment";

export interface QRCodeData {
  lotId: string;
  varietyName: string;
  level: string;
  timestamp: string;
  verificationUrl?: string;
}

export class QRCodeService {
  static async generateQRCode(data: QRCodeData): Promise<string> {
    try {
      const qrData = JSON.stringify({
        ...data,
        verificationUrl: `${config.client.url}/verify/${data.lotId}`,
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: "M",
        type: "image/png",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 200,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Erreur lors de la génération du QR code: ${error}`);
    }
  }

  static async generateQRCodeBuffer(data: QRCodeData): Promise<Buffer> {
    try {
      const qrData = JSON.stringify({
        ...data,
        verificationUrl: `${config.client.url}/verify/${data.lotId}`,
      });

      const buffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: "M",
        type: "png",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 200,
      });

      return buffer;
    } catch (error) {
      throw new Error(`Erreur lors de la génération du QR code: ${error}`);
    }
  }

  static parseQRCodeData(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString);
      if (data.lotId && data.varietyName && data.level && data.timestamp) {
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
