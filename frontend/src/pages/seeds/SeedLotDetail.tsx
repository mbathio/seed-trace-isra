// frontend/src/pages/seeds/SeedLotDetail.tsx - PAGE DE DÉTAILS LOT DE SEMENCES CORRIGÉE
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Package,
  QrCode,
  Calendar,
  User,
  MapPin,
  Leaf,
  Eye,
  Download,
  GitBranch,
  FlaskConical,
  Plus,
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
import { seedLotService } from "../../services/seedLotService"; // ✅ CORRIGÉ: Import correct
import { SeedLot } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";
import {
  LOT_STATUSES,
  getStatusConfig,
  getSeedLevelConfig,
} from "../../constants";

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
      // ✅ CORRIGÉ: Utilisation correcte du service
      const response = await seedLotService.getById(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  // Récupération de la généalogie
  const { data: genealogy } = useQuery({
    queryKey: ["seed-lot-genealogy", id],
    queryFn: async () => {
      const response = await seedLotService.getGenealogy(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status, LOT_STATUSES);
    return (
      <Badge variant={config.variant || "default"} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const config = getSeedLevelConfig(level);
    return (
      <Badge variant="outline" className={config.color}>
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

  if (error || !seedLot) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement du lot de semences
        </p>
        <Button
          onClick={() => navigate("/dashboard/seed-lots")}
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
            onClick={() => navigate("/dashboard/seed-lots")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="h-8 w-8 mr-3 text-green-600" />
              {seedLot.id}
            </h1>
            <p className="text-muted-foreground">
              {getLevelBadge(seedLot.level)} • {getStatusBadge(seedLot.status)}{" "}
              • {formatNumber(seedLot.quantity)} kg
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
            Certificat
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
                  {formatNumber(seedLot.quantity)}
                </p>
                <p className="text-xs text-muted-foreground">kg total</p>
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
                  {formatNumber(seedLot.availableQuantity)}
                </p>
                <p className="text-xs text-muted-foreground">kg disponible</p>
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
                <p className="text-xs text-muted-foreground">Production</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {seedLot._count?.qualityControls || 0}
                </p>
                <p className="text-xs text-muted-foreground">Contrôles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Informations</TabsTrigger>
          <TabsTrigger value="genealogy">Généalogie</TabsTrigger>
          <TabsTrigger value="quality">Contrôles Qualité</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations du lot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Code du lot
                    </label>
                    <p className="font-mono font-medium">{seedLot.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Niveau
                    </label>
                    <p>{getLevelBadge(seedLot.level)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Statut
                    </label>
                    <p>{getStatusBadge(seedLot.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Numéro de lot
                    </label>
                    <p className="font-medium">
                      {seedLot.batchNumber || "Non spécifié"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date de production
                    </label>
                    <p className="font-medium">
                      {formatDate(seedLot.productionDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date d'expiration
                    </label>
                    <p className="font-medium">
                      {seedLot.expiryDate
                        ? formatDate(seedLot.expiryDate)
                        : "Non spécifiée"}
                    </p>
                  </div>
                </div>

                {seedLot.notes && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Notes
                      </label>
                      <p className="mt-1 text-sm">{seedLot.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variété et acteurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {seedLot.variety && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Variété
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {seedLot.variety.name}
                      </span>
                      <Badge variant="outline">{seedLot.variety.code}</Badge>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Link to={`/dashboard/varieties/${seedLot.variety.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {seedLot.multiplier && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Multiplicateur
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {seedLot.multiplier.name}
                      </span>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Link
                          to={`/dashboard/multipliers/${seedLot.multiplier.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {seedLot.parcel && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Parcelle de production
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">
                        {seedLot.parcel.name || `Parcelle ${seedLot.parcel.id}`}
                      </span>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                      >
                        <Link to={`/dashboard/parcels/${seedLot.parcel.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Créé le</label>
                    <p>{formatDate(seedLot.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Modifié le</label>
                    <p>{formatDate(seedLot.updatedAt)}</p>
                  </div>
                </div>
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
                Relations parent-enfant et traçabilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {genealogy ? (
                <div className="space-y-4">
                  {seedLot.parentLot && (
                    <div>
                      <h4 className="font-medium mb-2">Lot parent</h4>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="font-mono">
                              {seedLot.parentLot.id}
                            </span>
                            <Badge>{seedLot.parentLot.level}</Badge>
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              to={`/dashboard/seed-lots/${seedLot.parentLot.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {seedLot.childLots && seedLot.childLots.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Lots dérivés ({seedLot.childLots.length})
                      </h4>
                      <div className="space-y-2">
                        {seedLot.childLots.map((childLot) => (
                          <div
                            key={childLot.id}
                            className="p-3 bg-green-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-green-600" />
                                <span className="font-mono">{childLot.id}</span>
                                <Badge>{childLot.level}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatNumber(childLot.quantity)} kg
                                </span>
                              </div>
                              <Button asChild variant="ghost" size="sm">
                                <Link
                                  to={`/dashboard/seed-lots/${childLot.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!seedLot.parentLot &&
                    (!seedLot.childLots || seedLot.childLots.length === 0) && (
                      <div className="text-center py-8">
                        <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Aucune relation généalogique
                        </h3>
                        <p className="text-muted-foreground">
                          Ce lot n'a pas de parent ni d'enfants enregistrés.
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Chargement de la généalogie...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2" />
                  Contrôles qualité
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau contrôle
                </Button>
              </CardTitle>
              <CardDescription>
                Historique des tests et certifications
              </CardDescription>
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
                      <TableHead className="text-right">Actions</TableHead>
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
                            {control.result === "pass" ? "Réussi" : "Échoué"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {control.inspector?.name || "Non spécifié"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Link
                              to={`/dashboard/quality-controls/${control.id}`}
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
                <div className="text-center py-8">
                  <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun contrôle qualité
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun test de qualité n'a encore été effectué sur ce lot.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Premier contrôle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Mouvements et traçabilité</CardTitle>
              <CardDescription>
                Historique des transferts et modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Fonctionnalité en développement
                </h3>
                <p className="text-muted-foreground">
                  L'historique des mouvements sera bientôt disponible.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeedLotDetail;
