// frontend/src/components/qr-code/QRCodeModal.tsx
import React, { useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, Printer, X, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { SeedLot } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  seedLot: SeedLot;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  seedLot,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (isOpen && seedLot) {
      generateQRCode();
    }
  }, [isOpen, seedLot]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Données encodées dans le QR Code
      const qrData = {
        id: seedLot.id,
        variety: {
          name: seedLot.variety?.name,
          code: seedLot.variety?.code,
        },
        level: seedLot.level,
        quantity: seedLot.quantity,
        productionDate: seedLot.productionDate,
        status: seedLot.status,
        multiplier: seedLot.multiplier?.name,
        batchNumber: seedLot.batchNumber,
        // URL pour traçabilité
        traceUrl: `${window.location.origin}/trace/${seedLot.id}`,
      };

      const qrString = JSON.stringify(qrData);

      // Générer le QR Code avec options personnalisées
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: 400,
        margin: 2,
        color: {
          dark: "#2c5530", // Vert ISRA
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Erreur lors de la génération du QR Code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.download = `qr-code-${seedLot.id}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!qrCodeDataUrl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
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
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: none; }
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
              <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />
            </div>
            
            <div class="info">
              <div class="info-row">
                <span class="label">Variété:</span>
                <span>${seedLot.variety?.name || "Non spécifié"} (${
      seedLot.variety?.code || ""
    })</span>
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
            
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
              <p>Scannez ce QR Code pour accéder à la traçabilité complète</p>
              <p>Généré le ${new Date().toLocaleString("fr-FR")}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
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

  const getLevelBadge = (level: string) => {
    const colors = {
      GO: "bg-red-100 text-red-800",
      G1: "bg-orange-100 text-orange-800",
      G2: "bg-yellow-100 text-yellow-800",
      G3: "bg-green-100 text-green-800",
      G4: "bg-blue-100 text-blue-800",
      R1: "bg-purple-100 text-purple-800",
      R2: "bg-pink-100 text-pink-800",
    };

    return (
      <Badge
        className={
          colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {level}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "En attente" },
      certified: { color: "bg-green-100 text-green-800", label: "Certifié" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeté" },
      "in-stock": { color: "bg-blue-100 text-blue-800", label: "En stock" },
      active: { color: "bg-green-100 text-green-800", label: "Actif" },
      distributed: {
        color: "bg-purple-100 text-purple-800",
        label: "Distribué",
      },
      sold: { color: "bg-gray-100 text-gray-800", label: "Vendu" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-green-600" />
            QR Code - {seedLot.id}
          </DialogTitle>
          <DialogDescription>
            Code QR pour la traçabilité et l'identification du lot de semences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du lot */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Variété
              </label>
              <p className="font-medium">
                {seedLot.variety?.name || "Non spécifié"}
              </p>
              <p className="text-sm text-gray-500">{seedLot.variety?.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Niveau
              </label>
              <div className="mt-1">{getLevelBadge(seedLot.level)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Quantité
              </label>
              <p className="font-medium">{formatNumber(seedLot.quantity)} kg</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Statut
              </label>
              <div className="mt-1">{getStatusBadge(seedLot.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Production
              </label>
              <p className="font-medium">
                {formatDate(seedLot.productionDate)}
              </p>
            </div>
            {seedLot.multiplier && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Multiplicateur
                </label>
                <p className="font-medium">{seedLot.multiplier.name}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* QR Code */}
          <div className="text-center">
            {isGenerating ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="text-sm text-gray-500">
                  Génération du QR Code...
                </p>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="space-y-4">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code pour ${seedLot.id}`}
                    className="max-w-full h-auto"
                    style={{ maxWidth: "300px" }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Scannez ce code pour accéder à la traçabilité complète
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <QrCode className="h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Erreur de génération du QR Code
                </p>
                <Button onClick={generateQRCode} variant="outline" size="sm">
                  Réessayer
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              Généré le {new Date().toLocaleString("fr-FR")}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={printQRCode}
                disabled={!qrCodeDataUrl}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button
                variant="outline"
                onClick={downloadQRCode}
                disabled={!qrCodeDataUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
