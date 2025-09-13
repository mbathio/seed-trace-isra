// frontend/src/pages/varieties/Varieties.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";

// Configuration de l'API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Types
interface Variety {
  id: number;
  code: string;
  name: string;
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances?: string[];
  origin?: string;
  releaseYear?: number;
  cropType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    seedLots: number;
  };
}

interface PaginatedResponse {
  success: boolean;
  message: string;
  data: Variety[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Labels pour les types de cultures
const cropTypeLabels: Record<string, string> = {
  rice: "Riz",
  maize: "Maïs",
  peanut: "Arachide",
  sorghum: "Sorgho",
  cowpea: "Niébé",
  millet: "Mil",
  wheat: "Blé",
};

// Couleurs pour les types de cultures
const cropTypeColors: Record<string, string> = {
  rice: "bg-green-100 text-green-800",
  maize: "bg-yellow-100 text-yellow-800",
  peanut: "bg-orange-100 text-orange-800",
  sorghum: "bg-red-100 text-red-800",
  cowpea: "bg-purple-100 text-purple-800",
  millet: "bg-blue-100 text-blue-800",
  wheat: "bg-amber-100 text-amber-800",
};

// Service API pour les variétés
const varietyService = {
  getAll: async (params?: any): Promise<PaginatedResponse> => {
    const token = localStorage.getItem("accessToken");

    // Nettoyer les paramètres pour éviter d'envoyer "undefined" comme string
    const cleanParams: any = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== "undefined"
        ) {
          cleanParams[key] = params[key];
        }
      });
    }

    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = `${API_BASE_URL}/varieties${
      queryParams ? `?${queryParams}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erreur ${response.status}: ${
          errorText || "Erreur lors de la récupération des variétés"
        }`
      );
    }

    const data = await response.json();
    return data;
  },

  getById: async (id: string | number): Promise<Variety> => {
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

  delete: async (id: number): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/varieties/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la variété");
    }
  },
};

const Varieties: React.FC = () => {
  const navigate = useNavigate();
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCropType, setSelectedCropType] = useState<string>("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // État pour le filtre dropdown
  const [showFilters, setShowFilters] = useState(false);

  // Fonction pour charger les variétés
  const loadVarieties = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      // N'ajouter le paramètre search que s'il y a une valeur
      if (searchTerm && searchTerm.trim() !== "") {
        params.search = searchTerm.trim();
      }

      // Ajouter le filtre de type de culture si sélectionné
      if (selectedCropType) {
        params.cropType = selectedCropType;
      }

      const response = await varietyService.getAll(params);
      setVarieties(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalCount(response.meta?.totalCount || 0);
    } catch (err) {
      console.error("Erreur lors du chargement des variétés:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Charger les variétés au montage et lors des changements de filtres
  useEffect(() => {
    loadVarieties();
  }, [currentPage, pageSize, sortBy, sortOrder, selectedCropType]);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadVarieties();
      } else {
        setCurrentPage(1); // Retourner à la première page lors d'une nouvelle recherche
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Gestionnaire de recherche
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Retourner à la première page
  };

  // Gestion du tri
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Retourner à la première page
  };

  // Gestion des actions
  const handleView = (variety: Variety) => {
    navigate(`/dashboard/varieties/${variety.id}`);
  };

  const handleEdit = (variety: Variety) => {
    navigate(`/dashboard/varieties/${variety.id}/edit`);
  };

  const handleDelete = async (variety: Variety) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la variété ${variety.name} ?`
      )
    ) {
      try {
        await varietyService.delete(variety.id);
        loadVarieties(); // Recharger la liste
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        alert("Erreur lors de la suppression de la variété");
      }
    }
  };

  const handleCreateNew = () => {
    navigate("/dashboard/varieties/create");
  };

  // Rendu des numéros de page
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            currentPage === i
              ? "z-10 bg-green-50 border-green-500 text-green-600"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Variétés
        </h1>
        <p className="text-gray-600">
          Gérer les variétés de semences de l'ISRA
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, code ou description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
            </button>

            {/* Dropdown des filtres */}
            {showFilters && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] z-10">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de culture
                    </label>
                    <select
                      value={selectedCropType}
                      onChange={(e) => {
                        setSelectedCropType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Tous</option>
                      {Object.entries(cropTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle variété
          </button>
        </div>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-green-500" />
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tableau des variétés */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("code")}
                  >
                    Code
                    {sortBy === "code" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    Nom
                    {sortBy === "name" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type de culture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maturité (jours)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rendement potentiel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lots de semences
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {varieties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Aucune variété trouvée
                    </td>
                  </tr>
                ) : (
                  varieties.map((variety) => (
                    <tr key={variety.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {variety.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variety.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cropTypeColors[variety.cropType] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cropTypeLabels[variety.cropType] ||
                            variety.cropType ||
                            "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {variety.maturityDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {variety.yieldPotential
                          ? `${variety.yieldPotential} T/ha`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {variety._count?.seedLots || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleView(variety)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(variety)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variety)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{" "}
                  <span className="font-medium">
                    {varieties.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  à{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalCount)}
                  </span>{" "}
                  sur <span className="font-medium">{totalCount}</span>{" "}
                  résultats
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-700">
                    Afficher:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {renderPageNumbers()}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Varieties;
