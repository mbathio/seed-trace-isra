// frontend/src/pages/TracePage.tsx - VERSION MODIFIÉE
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { seedLotService } from "../services/seedLotService";
import {
  Loader2,
  AlertTriangle,
  Printer,
  Download,
  Package,
  Calendar,
  User,
  Leaf,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { formatDate, formatNumber } from "../utils/formatters";

const TracePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["trace-lot", id],
    queryFn: async () => {
      const res = await seedLotService.getById(id!);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );

  if (error || !data)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
        <h2 className="text-xl font-semibold mb-2">Lot introuvable</h2>
        <p>Le QR code ne correspond à aucun lot de semences.</p>
      </div>
    );

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `${data.id}.png`;
    link.href = document
      .querySelector("canvas")
      ?.toDataURL("image/png") as string;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-8">
      <Card className="max-w-3xl w-full shadow-lg border-green-200">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-3xl font-bold text-green-700 flex items-center justify-center gap-2">
            <Package className="h-8 w-8 text-green-600" />
            {data.id}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Traçabilité complète du lot de semences
          </p>
        </CardHeader>

        <CardContent className="mt-6 space-y-6 text-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <p>
              <strong>Variété :</strong> {data.variety?.name}
            </p>
            <p>
              <strong>Code :</strong> {data.variety?.code}
            </p>
            <p>
              <strong>Niveau :</strong> <Badge>{data.level}</Badge>
            </p>
            <p>
              <strong>Quantité :</strong> {formatNumber(data.quantity)} kg
            </p>
            <p>
              <strong>Date de production :</strong>{" "}
              {formatDate(data.productionDate)}
            </p>
            <p>
              <strong>Multiplicateur :</strong>{" "}
              {data.multiplier?.name || "Non spécifié"}
            </p>
            <p>
              <strong>Statut :</strong> <Badge>{data.status}</Badge>
            </p>
            <p>
              <strong>Lot parent :</strong> {data.parentLotId || "Aucun"}
            </p>
          </div>

          <div className="flex flex-col items-center mt-6">
            <QRCodeCanvas
              value={`${window.location.origin}/trace/${data.id}`}
              size={200}
              fgColor="#14532d"
              className="shadow-md rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-3">
              Généré le {new Date().toLocaleString("fr-FR")}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Imprimer
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Télécharger
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TracePage;
