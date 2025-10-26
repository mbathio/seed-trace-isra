import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";
import { Card, CardContent } from "../components/ui/card";
import { Loader2 } from "lucide-react";

const ScanPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleScan = (data: any) => {
    if (!data) return;

    try {
      const text = typeof data === "string" ? data : data.text;
      const parsed = JSON.parse(text);
      console.log("✅ QR Code détecté :", parsed);

      if (parsed.traceUrl || parsed.id) {
        setLoading(true);
        navigate(`/trace/${parsed.id}`);
      } else {
        alert("QR Code invalide ou format non reconnu.");
      }
    } catch (error) {
      console.error("Erreur lecture QR :", error);
      alert("QR Code invalide.");
    }
  };

  const handleError = (err: any) => {
    console.error("Erreur du scanner :", err);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <h1 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            Scannez un QR Code de traçabilité
          </h1>

          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
              <p className="text-gray-600">Chargement du lot...</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-green-100 shadow-sm">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%" }}
              />
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4 text-center">
            Pointez la caméra vers le QR code d’un lot pour afficher sa fiche.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanPage;
