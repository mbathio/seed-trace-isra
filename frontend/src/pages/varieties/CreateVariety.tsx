// frontend/src/pages/varieties/CreateVariety.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const CreateVariety: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/varieties")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Créer une nouvelle variété</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la variété</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Formulaire de création de variété en cours de développement...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateVariety;
