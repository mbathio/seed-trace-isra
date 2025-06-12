// frontend/src/pages/multipliers/MultiplierDetail.tsx - PAGE DE DÉTAILS MULTIPLICATEUR
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  Package,
  Tractor,
  FileText,
  User,
  Award,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { api } from "../../services/api";
import { Multiplier } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";
import {
  MULTIPLIER_STATUSES,
  CERTIFICATION_LEVELS,
  CROP_TYPES,
  getStatusConfig,
} from "../../constants";
import { DataTransformer } from "../../utils/transformers";

const MultiplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: multiplier,
    isLoading,
    error,
  } = useQuery<Multiplier>({
    queryKey: ["multiplier", id],
    queryFn: async () => {
      const response = await api.get(`/multipliers/${id}`);
      return DataTransformer.transformMultiplierFromAPI(response.data.data);
    },
    enabled: !!id,
  });

  // Données des contrats
  const { data: contracts } = useQuery({
    queryKey: ["multiplier-contracts", id],
    queryFn: async () => {
      const response = await api.get(`/multipliers/${id}/contracts`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Données des parcelles
  const { data: parcels } = useQuery({
    queryKey: ["multiplier-parcels", id],
    queryFn: async () => {
      const response = await api.get(`/parcels?multiplierId=${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Données des productions
  const { data: productions } = useQuery({
    queryKey: ["multiplier-productions", id],
    queryFn: async () => {
      const response = await api.get(`/productions?multiplierId=${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

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

  const getSpecializationBadge = (specialization: string) => {
    const config = getStatusConfig(specialization, CROP_TYPES);
    return (
      <Badge variant="outline" className="text-xs">
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !multiplier) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement du multiplicateur
        </p>
        <Button
          onClick={() => navigate("/dashboard/multipliers")}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/multipliers")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <User className="h-8 w-8 mr-3 text-green-600" />
              {multiplier.name}
            </h1>
            <p className="text-muted-foreground">
              {getStatusBadge(multiplier.status)} •{" "}
              {getCertificationBadge(multiplier.certificationLevel)}
            </p>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {multiplier.yearsExperience}
                </p>
                <p className="text-xs text-muted-foreground">
                  Années d'expérience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {multiplier._count?.parcels || 0}
                </p>
                <p className="text-xs text-muted-foreground">Parcelles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {multiplier._count?.contracts || 0}
                </p>
                <p className="text-xs text-muted-foreground">Contrats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {multiplier._count?.seedLots || 0}
                </p>
                <p className="text-xs text-muted-foreground">Lots produits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Informations</TabsTrigger>
          <TabsTrigger value="parcels">Parcelles</TabsTrigger>
          <TabsTrigger value="contracts">Contrats</TabsTrigger>
          <TabsTrigger value="productions">Productions</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nom complet
                    </label>
                    <p className="font-medium">{multiplier.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Statut
                    </label>
                    <p>{getStatusBadge(multiplier.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Certification
                    </label>
                    <p>
                      {getCertificationBadge(multiplier.certificationLevel)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Expérience
                    </label>
                    <p className="font-medium">
                      {multiplier.yearsExperience} ans
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Adresse
                  </label>
                  <p className="mt-1">{multiplier.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Latitude
                    </label>
                    <p className="font-mono text-sm">{multiplier.latitude}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Longitude
                    </label>
                    <p className="font-mono text-sm">{multiplier.longitude}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact et spécialisations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {multiplier.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Téléphone
                      </label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{multiplier.phone}</span>
                      </div>
                    </div>
                  )}
                  {multiplier.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{multiplier.email}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Spécialisations
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {multiplier.specialization?.map((spec, index) => (
                      <span key={index}>{getSpecializationBadge(spec)}</span>
                    )) || <p className="text-muted-foreground">Aucune</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Créé le</label>
                    <p>{formatDate(multiplier.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Modifié le</label>
                    <p>{formatDate(multiplier.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parcels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Parcelles gérées
              </CardTitle>
              <CardDescription>
                Liste des parcelles sous la responsabilité de ce multiplicateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parcels && parcels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Superficie</TableHead>
                      <TableHead>Type de sol</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcels.map((parcel: any) => (
                      <TableRow key={parcel.id}>
                        <TableCell>
                          {parcel.name || `Parcelle ${parcel.id}`}
                        </TableCell>
                        <TableCell>{formatNumber(parcel.area)} ha</TableCell>
                        <TableCell>
                          {parcel.soilType || "Non spécifié"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{parcel.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Link to={`/dashboard/parcels/${parcel.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">
                  Aucune parcelle assignée à ce multiplicateur.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Contrats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contracts && contracts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variété</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract: any) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.variety.name}</TableCell>
                        <TableCell>
                          <Badge>{contract.seedLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(contract.startDate)} -{" "}
                          {formatDate(contract.endDate)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(contract.expectedQuantity)} kg
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{contract.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">
                  Aucun contrat pour ce multiplicateur.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tractor className="h-5 w-5 mr-2" />
                Productions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productions && productions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lot</TableHead>
                      <TableHead>Parcelle</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Rendement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productions.map((production: any) => (
                      <TableRow key={production.id}>
                        <TableCell className="font-mono">
                          {production.lotId}
                        </TableCell>
                        <TableCell>
                          {production.parcel?.name ||
                            `Parcelle ${production.parcelId}`}
                        </TableCell>
                        <TableCell>
                          {formatDate(production.startDate)}
                        </TableCell>
                        <TableCell>
                          {production.actualYield
                            ? `${formatNumber(production.actualYield)} t/ha`
                            : "En cours"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{production.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Link
                              to={`/dashboard/productions/${production.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">
                  Aucune production pour ce multiplicateur.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiplierDetail;
