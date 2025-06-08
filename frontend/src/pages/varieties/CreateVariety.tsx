// frontend/src/pages/varieties/CreateVariety.tsx
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const CreateVariety: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/varieties")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créer une variété</h1>
          <p className="text-muted-foreground">
            Ajouter une nouvelle variété au catalogue
          </p>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Formulaire de création de variété en cours de développement...
        </p>
      </div>
    </div>
  );
};

export default CreateVariety;
