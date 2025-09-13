// frontend/src/pages/varieties/VarietyDetail.tsx - VERSION COMPLÈTE
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Leaf,
  Calendar,
  MapPin,
  TrendingUp,
  Shield,
  Edit,
  Trash2,
  Package,
  BarChart3,
} from "lucide-react";
import { useApiQuery, useApiMutation } from "../../hooks/useApi";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { toast } from "react-toastify";

// Types
interface Variety {
  id: string;
  code: string;
  name: string;
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances: string[];
  origin?: string;
  releaseYear?: number;
  cropType: string;
  status: "ACTIVE" | "DISCONTINUED" | "EXPERIMENTAL";
  createdAt: string;
  updatedAt: string;
  seedLots?: SeedLot[];
  seedLotsCount?: number;
  contractsCount?: number;
}

interface SeedLot {
  id: string;
  lotNumber: string;
  quantity: number;
  unit: string;
  qualityGrade: string;
  productionDate: string;
  expiryDate: string;
  status: string;
  multiplier?: {
    id: string;
    name: string;
  };
  parcel?: {
    id: string;
    name: string;
  };
}

// Mappage des types de cultures pour l'affichage
const cropTypeLabels: Record<string, string> = {
  rice: "Riz",
  maize: "Maïs",
  peanut: "Arachide",
  sorghum: "Sorgho",
  cowpea: "Niébé",
  millet: "Mil",
  wheat: "Blé",
};

// Mappage des statuts pour l'affichage
const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  DISCONTINUED: "Discontinué",
  EXPERIMENTAL: "Expérimental",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DISCONTINUED: "bg-red-100 text-red-800",
  EXPERIMENTAL: "bg-yellow-100 text-yellow-800",
};

const VarietyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Requête pour récupérer les détails de la variété
  const {
    data: variety,
    isLoading,
    error,
    refetch,
  } = useApiQuery<Variety>(
    ["variety", id ?? ""],
    `/varieties/${id}`,
    {},
    { enabled: !!id }
  );

  // Mutation pour supprimer la variété
  const deleteVarietyMutation = useApiMutation(`/varieties/${id}`, "delete", {
    onSuccess: () => {
      toast.success("Variété supprimée avec succès !");
      navigate("/dashboard/varieties");
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    },
    invalidateQueries: [["varieties"]],
  });

  const handleEdit = () => {
    navigate(`/dashboard/varieties/${id}/edit`);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette variété ? Cette action est irréversible."
      )
    ) {
      deleteVarietyMutation.mutate({});
    }
  };

  const handleViewSeedLot = (seedLotId: string) => {
    navigate(`/dashboard/seed-lots/${seedLotId}`);
  };

  if (isLoading) {
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
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
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
          <h1 className="text-3xl font-bold">Erreur</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-red-600">
                Erreur lors du chargement de la variété : {error.message}
              </p>
              <Button onClick={() => refetch()}>Réessayer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!variety) {
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
          <h1 className="text-3xl font-bold">Variété non trouvée</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">
                La variété demandée n'existe pas ou n'est plus disponible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/varieties")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Leaf className="h-8 w-8 text-green-600" />
              {variety.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Code: {variety.code} •{" "}
              {cropTypeLabels[variety.cropType] || variety.cropType}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteVarietyMutation.isPending}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Statut */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[variety.status]
          }`}
        >
          {statusLabels[variety.status] || variety.status}
        </span>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {variety.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-600">{variety.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Maturité
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {variety.maturityDays} jours
                </p>
              </div>

              {variety.yieldPotential && (
                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Rendement
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    {variety.yieldPotential} T/ha
                  </p>
                </div>
              )}
            </div>

            {variety.origin && (
              <div>
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Origine
                </p>
                <p className="text-sm text-gray-600">{variety.origin}</p>
              </div>
            )}

            {variety.releaseYear && (
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Année de sortie
                </p>
                <p className="text-sm text-gray-600">{variety.releaseYear}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résistances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Résistances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {variety.resistances && variety.resistances.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {variety.resistances.map((resistance, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {resistance}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Aucune résistance renseignée
              </p>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Lots de semences
              </span>
              <span className="text-lg font-semibold text-blue-600">
                {variety.seedLotsCount || 0}
              </span>
            </div>

            {variety.contractsCount !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Contrats
                </span>
                <span className="text-lg font-semibold text-green-600">
                  {variety.contractsCount}
                </span>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  Créé le :{" "}
                  {new Date(variety.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <p>
                  Modifié le :{" "}
                  {new Date(variety.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lots de semences associés */}
      {variety.seedLots && variety.seedLots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lots de semences associés ({variety.seedLots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Numéro de lot
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Qualité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Production
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Multiplicateur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variety.seedLots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {lot.lotNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {lot.quantity} {lot.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lot.qualityGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(lot.productionDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {lot.multiplier?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {lot.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSeedLot(lot.id)}
                        >
                          Voir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VarietyDetail;
