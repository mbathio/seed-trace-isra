declare module "react-qr-scanner" {
  import * as React from "react";

  export interface QrScannerProps {
    delay?: number;
    style?: React.CSSProperties;
    onError?: (error: any) => void;
    onScan?: (data: string | null) => void;
    constraints?: MediaTrackConstraints;
    className?: string;
  }

  const QrScanner: React.FC<QrScannerProps>;
  export default QrScanner;
}
