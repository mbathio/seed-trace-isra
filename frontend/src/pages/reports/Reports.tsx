// frontend/src/pages/reports/Reports.tsx
import React from "react";
import { FileText, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ReportAPI } from "../../lib/api"; // ✅ ce fichier doit exister

interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

const Reports: React.FC = () => {
  const productionMutation = useMutation<ApiResponse>({
    mutationFn: async () => {
      const res = await ReportAPI.getProductionReport();
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("✅ Rapport de production généré !");
      console.log("📊 Production Report:", data);
    },
    onError: (err) => {
      console.error(err);
      toast.error("❌ Erreur lors de la génération du rapport");
    },
  });

  const qualityMutation = useMutation<ApiResponse>({
    mutationFn: async () => {
      const res = await ReportAPI.getQualityReport();
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("✅ Rapport qualité généré !");
      console.log("📊 Quality Report:", data);
    },
    onError: () => toast.error("❌ Erreur lors de la génération du rapport"),
  });

  const inventoryMutation = useMutation<ApiResponse>({
    mutationFn: async () => {
      const res = await ReportAPI.getInventoryReport();
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("✅ Rapport d’inventaire généré !");
      console.log("📊 Inventory Report:", data);
    },
    onError: () => toast.error("❌ Erreur lors de la génération du rapport"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">
            Analyses et statistiques du système
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Rapport de production */}
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => productionMutation.mutate()}
              disabled={productionMutation.isPending}
            >
              {productionMutation.isPending ? "Chargement..." : "Générer"}
            </Button>
          </CardContent>
        </Card>

        {/* Rapport qualité */}
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => qualityMutation.mutate()}
              disabled={qualityMutation.isPending}
            >
              {qualityMutation.isPending ? "Chargement..." : "Générer"}
            </Button>
          </CardContent>
        </Card>

        {/* Rapport inventaire */}
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => inventoryMutation.mutate()}
              disabled={inventoryMutation.isPending}
            >
              {inventoryMutation.isPending ? "Chargement..." : "Générer"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
