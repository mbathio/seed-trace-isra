// frontend/src/pages/varieties/Varieties.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Leaf, Layers, Eye, Package, Plus, Trash2 } from "lucide-react";
import { DeleteVarietyDialog } from "../../components/varieties/DeleteVarietyDialog";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface Variety {
  id: number;
  name: string;
  code: string;
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  cropType: string;
}

interface SeedLot {
  id: number;
  lotNumber: string;
  quantity: number;
  level: string;
  status: string;
  productionDate: string;
}

const cropTypeLabels: Record<string, string> = {
  rice: "Riz",
  maize: "Maïs",
  peanut: "Arachide",
  sorghum: "Sorgho",
  cowpea: "Niébé",
  millet: "Mil",
  wheat: "Blé",
};

const Varieties: React.FC = () => {
  const navigate = useNavigate();
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [expandedVariety, setExpandedVariety] = useState<number | null>(null);
  const [seedLots, setSeedLots] = useState<Record<number, SeedLot[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Variety | null>(
    null
  );

  // Charger la liste des cultures disponibles
  useEffect(() => {
    fetch(`${API_BASE_URL}/varieties`)
      .then((res) => res.json())
      .then((data) => {
        const allCropTypes = Array.from(
          new Set(data.data.map((v: Variety) => v.cropType))
        ) as string[];
        setCropTypes(allCropTypes);
      });
  }, []);

  // Charger les variétés d'une culture
  const loadVarieties = async (cropType: string) => {
    setLoading(true);
    setSelectedCrop(cropType);
    try {
      const res = await fetch(`${API_BASE_URL}/varieties?cropType=${cropType}`);
      const data = await res.json();
      setVarieties(data.data);
    } catch (err) {
      console.error("Erreur chargement variétés:", err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les lots pour une variété
  const loadSeedLots = async (varietyId: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/seed-lots?varietyId=${varietyId}`
      );
      const data = await res.json();
      setSeedLots((prev) => ({ ...prev, [varietyId]: data.data }));
      setExpandedVariety(expandedVariety === varietyId ? null : varietyId);
    } catch (err) {
      console.error("Erreur chargement lots:", err);
    }
  };

  // Supprimer une variété
  const handleDeleteVariety = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/varieties/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVarieties(varieties.filter((v) => v.id !== id));
        setSelectedForDelete(null);
      } else {
        alert("Erreur lors de la suppression de la variété.");
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Catalogue des Spéculations et Variétés
        </h1>
        <Button
          className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          onClick={() => navigate("/dashboard/varieties/create")}
        >
          <Plus className="h-4 w-4" /> Nouvelle variété
        </Button>
      </div>

      {/* Liste des cultures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cropTypes.map((crop) => (
          <Card key={crop}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="text-green-600" />
                <span className="capitalize">
                  {cropTypeLabels[crop] || crop}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => loadVarieties(crop)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Voir les variétés
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Variétés d'une culture */}
      {selectedCrop && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Variétés de {cropTypeLabels[selectedCrop] || selectedCrop}
          </h2>

          {loading ? (
            <p>Chargement...</p>
          ) : varieties.length === 0 ? (
            <p className="text-gray-500">Aucune variété trouvée.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {varieties.map((v) => (
                <Card key={v.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{v.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/dashboard/varieties/${v.id}`)
                          }
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4 text-green-700" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedForDelete(v)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Code : {v.code} • {v.maturityDays} j •{" "}
                      {v.yieldPotential || "?"} T/ha
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-3">{v.description}</p>
                    <Button
                      onClick={() => loadSeedLots(v.id)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Layers className="h-4 w-4" /> Voir les niveaux de
                      semences
                    </Button>

                    {/* Affichage des lots par niveau */}
                    {expandedVariety === v.id && seedLots[v.id] && (
                      <div className="mt-4 border-t pt-3 space-y-2">
                        {Object.entries(
                          seedLots[v.id].reduce((acc, lot) => {
                            acc[lot.level] = acc[lot.level] || [];
                            acc[lot.level].push(lot);
                            return acc;
                          }, {} as Record<string, SeedLot[]>)
                        ).map(([level, lots]) => (
                          <div key={level}>
                            <h3 className="font-semibold text-green-700 flex items-center gap-1">
                              <Package className="h-4 w-4" /> Niveau {level}
                            </h3>
                            <ul className="pl-4 list-disc text-sm text-gray-700">
                              {lots.map((lot) => (
                                <li
                                  key={lot.id}
                                  onClick={() =>
                                    navigate(`/dashboard/seed-lots/${lot.id}`)
                                  }
                                  className="cursor-pointer hover:text-green-600"
                                >
                                  Lot {lot.lotNumber} – {lot.quantity} kg –{" "}
                                  {lot.status} –{" "}
                                  {new Date(
                                    lot.productionDate
                                  ).toLocaleDateString("fr-FR")}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialogue de suppression */}
      {selectedForDelete && (
        <DeleteVarietyDialog
          variety={selectedForDelete}
          onCancel={() => setSelectedForDelete(null)}
          onConfirm={() => handleDeleteVariety(selectedForDelete.id)}
        />
      )}
    </div>
  );
};

export default Varieties;
