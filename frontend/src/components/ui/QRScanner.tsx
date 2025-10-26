// frontend/src/components/QRScanner.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
  // options éventuelles
  onError?: (error: unknown) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onError }) => {
  const navigate = useNavigate();

  const handleScan = (results: Array<{ rawValue: string }>) => {
    if (results.length > 0) {
      const result = results[0].rawValue;
      console.log("QR code détecté :", result);

      // Suppose que le QR encode directement l’URL vers /trace/:id
      if (result.startsWith(window.location.origin)) {
        // Si c’est une URL du domaine, on redirige directement
        window.location.href = result;
      } else if (result.startsWith("/trace/")) {
        navigate(result);
      } else {
        // Autre traitement possible
        console.warn("URL inconnue scannée :", result);
      }
    }
  };

  const handleError = (error: unknown) => {
    console.error("Erreur lors du scan QR :", error);
    if (onError) onError(error);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Scanner
        onScan={handleScan}
        onError={handleError}
        constraints={{ facingMode: "environment" }} // utilise caméra arrière
        scanDelay={500}
      />
      <p>Placez un QR code devant la caméra...</p>
    </div>
  );
};

export default QRScanner;
