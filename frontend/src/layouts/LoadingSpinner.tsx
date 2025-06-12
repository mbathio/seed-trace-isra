import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils"; // ✅ CORRIGÉ: Chemin d'importation fixé

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  message,
}) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="text-center">
        <Loader2 className={cn("animate-spin", sizeMap[size], "mx-auto")} />
        {message && (
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
};
