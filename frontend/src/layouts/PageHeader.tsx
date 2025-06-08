// frontend/src/components/layout/PageHeader.tsx
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backTo,
  actions,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {backTo && (
          <Button
            variant="ghost"
            onClick={() => navigate(backTo)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
  );
};
