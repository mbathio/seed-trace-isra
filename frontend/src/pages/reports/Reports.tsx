// frontend/src/pages/reports/Reports.tsx
import React from "react";
import { FileText, Download, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">
            Analyses et statistiques du système
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Générer rapport
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Analyse des performances de production
            </p>
            <Button variant="outline" className="w-full">
              Générer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Qualité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Rapport des contrôles qualité
            </p>
            <Button variant="outline" className="w-full">
              Générer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Inventaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              État des stocks de semences
            </p>
            <Button variant="outline" className="w-full">
              Générer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
