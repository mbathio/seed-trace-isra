// frontend/src/pages/quality/QualityControls.tsx
import React from "react";
import { Plus, FlaskConical } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const QualityControls: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contrôles qualité</h1>
          <p className="text-muted-foreground">
            Gérez les tests et certifications
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau contrôle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="h-5 w-5 mr-2" />
            Contrôles qualité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Page des contrôles qualité en cours de développement...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityControls;
