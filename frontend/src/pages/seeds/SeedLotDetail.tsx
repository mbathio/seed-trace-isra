// frontend/src/pages/seeds/SeedLotDetail.tsx
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  QrCode,
  Download,
  Eye,
  Calendar,
  MapPin,
  User,
  Package,
  FlaskConical,
  Tractor,
  GitBranch,
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
import { SeedLot } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";

const SeedLotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: seedLot,
    isLoading,
    error,
  } = useQuery<SeedLot>({
    queryKey: ["seed-lot", id],
    queryFn: async () => {
      const response = await api.get(`/seeds/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "En attente" },
      certified: { variant: "default", label: "Certifié" },
      rejected: { variant: "destructive", label: "Rejeté" },
      "in-stock": { variant: "outline", label: "En stock" },
      active: { variant: "default", label: "Actif" },
      distributed: { variant: "secondary", label: "Distribué" },
    };

    const config = statusMap[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      GO: "bg-red-100 text-red-800",
      G1: "bg-orange-100 text-orange-800",
      G2: "bg-yellow-100 text-yellow-800",
      G3: "bg-green-100 text-green-800",
      G4: "bg-blue-100 text-blue-800",
      R1: "bg-purple-100 text-purple-800",
      R2: "bg-pink-100 text-pink-800",
    };

    return (
      <Badge className={colors[level] || "bg-gray-100 text-gray-800"}>
        {level}
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

  if (error || !seedLot) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement du lot</p>
        <Button onClick={() => navigate("/seeds")} className="mt-4">
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
            onClick={() => navigate("/seeds")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Lot {seedLot.id}</h1>
            <p className="text-muted-foreground">
              {seedLot.variety.name} - {getLevelBadge(seedLot.level)}{" "}
              {getStatusBadge(seedLot.status)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {formatNumber(seedLot.quantity)} kg
                </p>
                <p className="text-xs text-muted-foreground">Quantité</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatDate(seedLot.productionDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Date de production
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {seedLot.multiplier?.name || "Non assigné"}
                </p>
                <p className="text-xs text-muted-foreground">Multiplicateur</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {seedLot.parcel?.name || "Non assignée"}
                </p>
                <p className="text-xs text-muted-foreground">Parcelle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="genealogy">Généalogie</TabsTrigger>
          <TabsTrigger value="quality">Contrôles qualité</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      ID du lot
                    </Label>
                    <p className="font-mono">{seedLot.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Numéro de lot
                    </Label>
                    <p>{seedLot.batchNumber || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Niveau
                    </Label>
                    <p>{getLevelBadge(seedLot.level)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Statut
                    </Label>
                    <p>{getStatusBadge(seedLot.status)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Notes
                  </Label>
                  <p className="mt-1 text-sm">
                    {seedLot.notes || "Aucune note"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variété</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{seedLot.variety.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Code: {seedLot.variety.code}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">
                      Type de culture
                    </Label>
                    <p className="capitalize">
                      {seedLot.variety.cropType.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Maturité</Label>
                    <p>{seedLot.variety.maturityDays} jours</p>
                  </div>
                </div>

                {seedLot.variety.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Description
                    </Label>
                    <p className="mt-1 text-sm">
                      {seedLot.variety.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="genealogy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="h-5 w-5 mr-2" />
                Généalogie du lot
              </CardTitle>
              <CardDescription>
                Traçabilité et filiation du lot de semences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seedLot.parentLot ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Lot parent</h4>
                    <div className="mt-2 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">
                            {seedLot.parentLot.id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {seedLot.parentLot.variety.name} -{" "}
                            {seedLot.parentLot.level}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/seeds/${seedLot.parentLot.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Ce lot n'a pas de lot parent (génération origine).
                </p>
              )}

              {seedLot.childLots && seedLot.childLots.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium">Lots enfants</h4>
                  <div className="mt-2 space-y-2">
                    {seedLot.childLots.map((childLot) => (
                      <div key={childLot.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm">{childLot.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {childLot.variety.name} - {childLot.level}
                            </p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/seeds/${childLot.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FlaskConical className="h-5 w-5 mr-2" />
                Contrôles qualité
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seedLot.qualityControls && seedLot.qualityControls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Germination</TableHead>
                      <TableHead>Pureté</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead>Inspecteur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seedLot.qualityControls.map((control) => (
                      <TableRow key={control.id}>
                        <TableCell>{formatDate(control.controlDate)}</TableCell>
                        <TableCell>{control.germinationRate}%</TableCell>
                        <TableCell>{control.varietyPurity}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              control.result === "pass"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {control.result === "pass" ? "Réussi" : "Échec"}
                          </Badge>
                        </TableCell>
                        <TableCell>{control.inspector.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">
                  Aucun contrôle qualité effectué pour ce lot.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tractor className="h-5 w-5 mr-2" />
                Informations de production
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Multiplicateur</h4>
                  {seedLot.multiplier ? (
                    <div className="space-y-2">
                      <p>
                        <strong>Nom:</strong> {seedLot.multiplier.name}
                      </p>
                      <p>
                        <strong>Adresse:</strong> {seedLot.multiplier.address}
                      </p>
                      <p>
                        <strong>Expérience:</strong>{" "}
                        {seedLot.multiplier.yearsExperience} ans
                      </p>
                      <p>
                        <strong>Certification:</strong>{" "}
                        {seedLot.multiplier.certificationLevel}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Non assigné</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3">Parcelle</h4>
                  {seedLot.parcel ? (
                    <div className="space-y-2">
                      <p>
                        <strong>Nom:</strong>{" "}
                        {seedLot.parcel.name || "Sans nom"}
                      </p>
                      <p>
                        <strong>Superficie:</strong> {seedLot.parcel.area} ha
                      </p>
                      <p>
                        <strong>Type de sol:</strong>{" "}
                        {seedLot.parcel.soilType || "Non spécifié"}
                      </p>
                      <p>
                        <strong>Irrigation:</strong>{" "}
                        {seedLot.parcel.irrigationSystem || "Non spécifiée"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Non assignée</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for labels
const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => <span className={`text-sm font-medium ${className}`}>{children}</span>;

export default SeedLotDetail;
