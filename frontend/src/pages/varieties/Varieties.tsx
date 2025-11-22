// frontend/src/pages/varieties/Varieties.tsx - VERSION AMÉLIORÉE
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Leaf,
  Layers,
  Eye,
  Package,
  Plus,
  Trash2,
  Search,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DeleteVarietyDialog } from "../../components/varieties/DeleteVarietyDialog";
import { apiService } from "../../services/api";

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

const cropTypeIcons: Record<string, string> = {
  rice: "🌾",
  maize: "🌽",
  peanut: "🥜",
  sorghum: "🌾",
  cowpea: "🫘",
  millet: "🌾",
  wheat: "🌾",
};

const cropTypeColors: Record<string, string> = {
  rice: "from-amber-500 to-yellow-600",
  maize: "from-yellow-500 to-orange-600",
  peanut: "from-orange-500 to-red-600",
  sorghum: "from-red-500 to-pink-600",
  cowpea: "from-green-500 to-teal-600",
  millet: "from-blue-500 to-indigo-600",
  wheat: "from-purple-500 to-pink-600",
};

const Varieties: React.FC = () => {
  const navigate = useNavigate();
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [expandedVariety, setExpandedVariety] = useState<number | null>(null);
  const [seedLots, setSeedLots] = useState<Record<number, SeedLot[]>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
      const res = await apiService.get<{ data: any[] }>(`/seed-lots`, {
        params: { varietyId },
      });
      setSeedLots((prev) => ({ ...prev, [varietyId]: res.data }));
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

  // Filtrer les variétés selon la recherche
  const filteredVarieties = varieties.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne avec gradient */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Catalogue des Variétés
              </h1>
              <p className="text-gray-600">
                Gérez et consultez toutes vos variétés de semences
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 px-6 py-6"
              onClick={() => navigate("/dashboard/varieties/create")}
            >
              <Plus className="h-5 w-5" /> Nouvelle variété
            </Button>
          </div>
        </div>

        {/* Sélection des cultures avec design amélioré */}
        {!selectedCrop && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600" />
              Sélectionnez une spéculation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cropTypes.map((crop) => (
                <Card
                  key={crop}
                  className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-500 overflow-hidden"
                  onClick={() => loadVarieties(crop)}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${cropTypeColors[crop]}`}
                  ></div>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-4xl">
                        {cropTypeIcons[crop] || "🌱"}
                      </span>
                      <div>
                        <span className="text-lg font-bold text-gray-800 block">
                          {cropTypeLabels[crop] || crop}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                          {crop.toUpperCase()}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadVarieties(crop);
                      }}
                    >
                      Voir les variétés
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Section des variétés avec recherche et filtres */}
        {selectedCrop && (
          <div className="space-y-6">
            {/* Barre d'outils améliorée */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCrop(null);
                      setVarieties([]);
                      setSearchTerm("");
                    }}
                    className="border-2 hover:border-green-500"
                  >
                    ← Retour
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="text-3xl">
                        {cropTypeIcons[selectedCrop]}
                      </span>
                      {cropTypeLabels[selectedCrop] || selectedCrop}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredVarieties.length} variété(s) disponible(s)
                    </p>
                  </div>
                </div>

                {/* Barre de recherche moderne */}
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Liste des variétés avec design amélioré */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
              </div>
            ) : filteredVarieties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">Aucune variété trouvée</p>
                {searchTerm && (
                  <p className="text-gray-400 mt-2">
                    Essayez de modifier votre recherche
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVarieties.map((v) => (
                  <Card
                    key={v.id}
                    className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-400 overflow-hidden"
                  >
                    <div
                      className={`h-1.5 bg-gradient-to-r ${cropTypeColors[selectedCrop]}`}
                    ></div>

                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                            {v.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">
                              {v.code}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/dashboard/varieties/${v.id}`)
                            }
                            className="hover:bg-green-100 hover:text-green-700"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedForDelete(v)}
                            className="hover:bg-red-100 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Métriques clés avec design moderne */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-blue-700 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Maturité
                            </span>
                          </div>
                          <p className="text-lg font-bold text-blue-900">
                            {v.maturityDays} j
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-700 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Rendement
                            </span>
                          </div>
                          <p className="text-lg font-bold text-green-900">
                            {v.yieldPotential || "N/A"} T/ha
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {v.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {v.description}
                        </p>
                      )}

                      <Button
                        onClick={() => loadSeedLots(v.id)}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-2 hover:border-green-500 hover:bg-green-50 transition-all"
                      >
                        <Layers className="h-4 w-4" />
                        {expandedVariety === v.id ? (
                          <>
                            <span>Masquer les lots</span>
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>Voir les lots de semences</span>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </Button>

                      {/* Affichage des lots par niveau - Design amélioré */}
                      {expandedVariety === v.id && seedLots[v.id] && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl space-y-3 border-2 border-gray-200">
                          {Object.entries(
                            seedLots[v.id].reduce((acc, lot) => {
                              acc[lot.level] = acc[lot.level] || [];
                              acc[lot.level].push(lot);
                              return acc;
                            }, {} as Record<string, SeedLot[]>)
                          ).map(([level, lots]) => (
                            <div
                              key={level}
                              className="bg-white rounded-lg p-3 shadow-sm"
                            >
                              <h3 className="font-bold text-green-700 flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4" />
                                Niveau {level}
                                <span className="ml-auto text-xs bg-green-100 px-2 py-1 rounded-full">
                                  {lots.length} lot(s)
                                </span>
                              </h3>
                              <ul className="space-y-2">
                                {lots.map((lot) => (
                                  <li
                                    key={lot.id}
                                    onClick={() =>
                                      navigate(`/dashboard/seed-lots/${lot.id}`)
                                    }
                                    className="cursor-pointer p-2 hover:bg-green-50 rounded-lg transition-colors text-sm flex items-center justify-between group"
                                  >
                                    <div>
                                      <span className="font-medium text-gray-900 group-hover:text-green-700">
                                        Lot {lot.lotNumber}
                                      </span>
                                      <span className="text-gray-500 mx-2">
                                        •
                                      </span>
                                      <span className="text-gray-600">
                                        {lot.quantity} kg
                                      </span>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        lot.status === "available"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {lot.status}
                                    </span>
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

        {/* Dialogue de suppression - Design amélioré */}
        {selectedForDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir supprimer la variété{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedForDelete.name}
                  </span>{" "}
                  ?
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedForDelete(null)}
                  className="flex-1 border-2"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => handleDeleteVariety(selectedForDelete.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Varieties;
