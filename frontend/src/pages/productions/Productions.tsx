// frontend/src/pages/productions/Productions.tsx
import React from "react";
import { Plus, Tractor } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const Productions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productions</h1>
          <p className="text-muted-foreground">
            Suivez les cycles de production
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle production
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tractor className="h-5 w-5 mr-2" />
            Cycles de production
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Page des productions en cours de développement...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Productions;
