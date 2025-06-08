// frontend/src/pages/multipliers/Multipliers.tsx
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const Multipliers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multiplicateurs</h1>
          <p className="text-muted-foreground">
            Gérez les producteurs de semences
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau multiplicateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des multiplicateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Page des multiplicateurs en cours de développement...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Multipliers;
