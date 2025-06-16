import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

// Configuration de l'API
const API_BASE_URL = "http://localhost:3001/api";

// Types
interface Variety {
  id: string;
  name: string;
  description: string;
  maturityDays: number;
  yieldPotential: number;
  resistances: string[];
  origin: string;
  releaseYear: number;
  cropType?: string;
  status: "ACTIVE" | "DISCONTINUED" | "EXPERIMENTAL";
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: Variety[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Service API pour les variétés (utilisant fetch natif)
const varietyService = {
  getAll: async (params?: any): Promise<PaginatedResponse> => {
    const token = localStorage.getItem("accessToken");
    console.log("Token:", token ? "Present" : "Absent"); // Debug

    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/varieties?${queryParams}`;
    console.log("Fetching URL:", url); // Debug

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    console.log("Response status:", response.status); // Debug

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText); // Debug
      throw new Error(
        `Erreur ${response.status}: ${
          errorText || "Erreur lors de la récupération des variétés"
        }`
      );
    }

    const data = await response.json();
    console.log("Data received:", data); // Debug

    // Adapter la structure de la réponse API
    return {
      data: data.data || [],
      meta: data.meta || {
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      },
    };
  },

  getById: async (id: string): Promise<Variety> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/varieties/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la variété");
    }

    const data = await response.json();
    return data.data;
  },

  create: async (data: any): Promise<Variety> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/varieties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de la variété");
    }

    const result = await response.json();
    return result.data;
  },

  update: async (id: string, data: any): Promise<Variety> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/varieties/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de la variété");
    }

    const result = await response.json();
    return result.data;
  },

  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/varieties/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la variété");
    }
  },
};

export default function VarietiesPage() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedVarieties, setSelectedVarieties] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Variety>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const pageSize = 10;

  // Récupérer les données depuis l'API
  const fetchVarieties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await varietyService.getAll({
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        sortBy: sortField,
        sortOrder: sortDirection,
      });

      console.log("Response:", response); // Debug

      setVarieties(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalCount(response.meta.totalCount);
    } catch (err: any) {
      console.error("Erreur lors du chargement des variétés:", err);

      // Gestion d'erreur plus détaillée
      if (err.message.includes("401")) {
        setError("Vous devez être connecté pour accéder aux variétés.");
      } else if (
        err.message.includes("NetworkError") ||
        err.message.includes("Failed to fetch")
      ) {
        setError(
          "Impossible de se connecter au serveur. Vérifiez que le backend est démarré."
        );
      } else {
        setError(err.message || "Impossible de charger les variétés.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand les paramètres changent
  useEffect(() => {
    fetchVarieties();
  }, [currentPage, sortField, sortDirection]);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchVarieties();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSort = (field: keyof Variety) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedVarieties.length === varieties.length) {
      setSelectedVarieties([]);
    } else {
      setSelectedVarieties(varieties.map((v) => v.id));
    }
  };

  const handleSelectVariety = (id: string) => {
    if (selectedVarieties.includes(id)) {
      setSelectedVarieties(selectedVarieties.filter((v) => v !== id));
    } else {
      setSelectedVarieties([...selectedVarieties, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      DISCONTINUED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Discontinuée",
      },
      EXPERIMENTAL: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Expérimentale",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getCropTypeBadge = (cropType?: string) => {
    if (!cropType) return null;

    const cropConfig = {
      RICE: { bg: "bg-blue-100", text: "text-blue-800", label: "Riz" },
      MAIZE: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Maïs" },
      PEANUT: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Arachide",
      },
      SORGHUM: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Sorgho",
      },
      COWPEA: { bg: "bg-pink-100", text: "text-pink-800", label: "Niébé" },
      MILLET: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Mil" },
      WHEAT: { bg: "bg-amber-100", text: "text-amber-800", label: "Blé" },
    };

    const config = cropConfig[cropType as keyof typeof cropConfig] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: cropType,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette variété ?")) {
      try {
        await varietyService.delete(id);
        fetchVarieties();
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Impossible de supprimer la variété");
      }
    }
  };

  if (error && varieties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchVarieties}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gestion des Variétés de Semences
              </h1>
              <p className="text-gray-600">
                Catalogue complet des variétés de semences de l'ISRA Saint-Louis
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-5 w-5" />
              Nouvelle variété
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">Total des variétés</div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">Variétés actives</div>
            <div className="text-2xl font-bold text-green-600">
              {varieties.filter((v) => v.status === "ACTIVE").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">Expérimentales</div>
            <div className="text-2xl font-bold text-yellow-600">
              {varieties.filter((v) => v.status === "EXPERIMENTAL").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">Discontinuées</div>
            <div className="text-2xl font-bold text-red-600">
              {varieties.filter((v) => v.status === "DISCONTINUED").length}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, description, origine..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-5 w-5" />
                Filtres
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="h-5 w-5" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={
                        selectedVarieties.length === varieties.length &&
                        varieties.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    Nom{" "}
                    {sortField === "name" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("maturityDays")}
                  >
                    Maturité{" "}
                    {sortField === "maturityDays" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("yieldPotential")}
                  >
                    Rendement{" "}
                    {sortField === "yieldPotential" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Résistances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : varieties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Aucune variété trouvée
                    </td>
                  </tr>
                ) : (
                  varieties.map((variety) => (
                    <tr key={variety.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          checked={selectedVarieties.includes(variety.id)}
                          onChange={() => handleSelectVariety(variety.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {variety.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {variety.origin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCropTypeBadge(variety.cropType)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {variety.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {variety.maturityDays} jours
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {variety.yieldPotential} t/ha
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {variety.resistances
                            .slice(0, 2)
                            .map((resistance, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                              >
                                {resistance}
                              </span>
                            ))}
                          {variety.resistances.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{variety.resistances.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(variety.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-green-600 hover:text-green-700"
                            title="Voir"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-700"
                            title="Modifier"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-700"
                            title="Supprimer"
                            onClick={() => handleDelete(variety.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de{" "}
                {varieties.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} à{" "}
                {Math.min(currentPage * pageSize, totalCount)} sur {totalCount}{" "}
                variétés
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} sur {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
