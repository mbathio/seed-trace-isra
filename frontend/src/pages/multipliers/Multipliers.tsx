// frontend/src/pages/multipliers/Multipliers.tsx - VERSION CORRIGÉE
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";
import { Multiplier } from "../../types/entities";
import { ApiResponse } from "../../types/api";
import {
  MULTIPLIER_STATUSES,
  CERTIFICATION_LEVELS,
  CROP_TYPES,
  getStatusConfig,
} from "../../constants";
import { DataTransformer } from "../../utils/transformers";
import { useDebounce } from "../../hooks/useDebounce";

const Multipliers: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [certificationFilter, setCertificationFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // ✅ CORRIGÉ: Query avec gestion de la transformation
  const { data, isLoading, error } = useQuery<ApiResponse<Multiplier[]>>({
    queryKey: [
      "multipliers",
      debouncedSearch,
      statusFilter,
      certificationFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter) params.append("status", statusFilter);
      if (certificationFilter)
        params.append("certificationLevel", certificationFilter);

      const response = await api.get(`/multipliers?${params.toString()}`);

      // ✅ Transformer les données reçues de l'API
      const transformedData = {
        ...response.data,
        data: response.data.data.map((multiplier: any) =>
          DataTransformer.transformMultiplierFromAPI(multiplier)
        ),
      };

      return transformedData;
    },
  });

  // ✅ CORRIGÉ: Utilisation des constantes pour les badges de statut
  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, MULTIPLIER_STATUSES);
    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.gray;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  // ✅ CORRIGÉ: Utilisation des constantes pour les badges de certification
  const getCertificationBadge = (level: string) => {
    const config = getStatusConfig(level, CERTIFICATION_LEVELS);

    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.blue;
    const stars =
      config.experience === "0-2 ans"
        ? 1
        : config.experience === "2-5 ans"
        ? 2
        : 3;

    return (
      <div className="flex items-center space-x-2">
        <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
        <div className="flex">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < stars ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  // ✅ CORRIGÉ: Badge pour spécialisations utilisant les constantes
  const getSpecializationBadge = (specialization: string) => {
    const config = getStatusConfig(specialization, CROP_TYPES);
    return (
      <Badge variant="outline" className="text-xs">
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  // ✅ CORRECTION: Fonctions utilitaires pour les calculs sécurisés avec transformation
  const getActiveMultipliers = () => {
    return (
      data?.data?.filter((m: Multiplier) => m.status === "active").length || 0
    );
  };

  const getExpertMultipliers = () => {
    return (
      data?.data?.filter((m: Multiplier) => m.certificationLevel === "expert")
        .length || 0
    );
  };

  const getAverageExperience = () => {
    if (!data?.data || data.data.length === 0) return 0;
    const total = data.data.reduce(
      (avg: number, m: Multiplier) => avg + m.yearsExperience,
      0
    );
    return Math.round(total / data.data.length);
  };

  const getTotalParcels = () => {
    return (
      data?.data?.reduce(
        (sum: number, m: Multiplier) => sum + (m._count?.parcels || 0),
        0
      ) || 0
    );
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement des multiplicateurs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Multiplicateurs
          </h1>
          <p className="text-muted-foreground">
            Suivi et gestion des multiplicateurs de semences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-white">
            <Plus className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un multiplicateur
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un multiplicateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {MULTIPLIER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={certificationFilter}
              onValueChange={setCertificationFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les certifications</SelectItem>
                {CERTIFICATION_LEVELS.map((cert) => (
                  <SelectItem key={cert.value} value={cert.value}>
                    {cert.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {getActiveMultipliers()}
            </div>
            <p className="text-sm text-muted-foreground">
              Multiplicateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {getExpertMultipliers()}
            </div>
            <p className="text-sm text-muted-foreground">Experts certifiés</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {getAverageExperience()}
            </div>
            <p className="text-sm text-muted-foreground">
              Années d'expérience moy.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {getTotalParcels()}
            </div>
            <p className="text-sm text-muted-foreground">Parcelles gérées</p>
          </CardContent>
        </Card>
      </div>

      {/* Grille des multiplicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? // Skeleton loading
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : data?.data?.map((multiplier: Multiplier) => (
              <Card
                key={multiplier.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {multiplier.name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {multiplier.address}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Statut:
                      </span>
                      {getStatusBadge(multiplier.status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Certification:
                      </span>
                      {getCertificationBadge(multiplier.certificationLevel)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Expérience:
                      </span>
                      <span className="font-medium">
                        {multiplier.yearsExperience} ans
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Parcelles:
                      </span>
                      <span className="font-medium">
                        {multiplier._count?.parcels || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Contrats:
                      </span>
                      <span className="font-medium">
                        {multiplier._count?.contracts || 0}
                      </span>
                    </div>
                  </div>

                  {/* Spécialisations */}
                  {multiplier.specialization &&
                    multiplier.specialization.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-muted-foreground mb-2">
                          Spécialisations:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {multiplier.specialization
                            .slice(0, 2)
                            .map((spec: string, index: number) => (
                              <span key={index}>
                                {getSpecializationBadge(spec)}
                              </span>
                            ))}
                          {multiplier.specialization.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{multiplier.specialization.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Contact */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      {multiplier.phone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="text-xs">{multiplier.phone}</span>
                        </div>
                      )}
                      {multiplier.email && (
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="text-xs">Email</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && (!data?.data || data.data.length === 0) && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun multiplicateur trouvé
            </h3>
            <p className="text-muted-foreground mb-4">
              {search || statusFilter || certificationFilter
                ? "Aucun multiplicateur ne correspond à vos critères de recherche."
                : "Commencez par ajouter votre premier multiplicateur."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un multiplicateur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Multipliers;
