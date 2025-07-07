// frontend/src/pages/seeds/SeedLotDetail.tsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Trash2,
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
  Loader2,
  AlertTriangle,
  MoreVertical,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Printer,
  Share2,
  FileText,
  Activity,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Progress } from "../../components/ui/progress";
import { QRCodeModal } from "../../components/qr-code/QRCodeModal";
import { DeleteSeedLotDialog } from "../../components/seeds/DeleteSeedLotDialog";
import { seedLotService } from "../../services/seedLotService";
import { SeedLot, QualityControl, Production } from "../../types/entities";
import { formatDate, formatNumber, formatDateTime } from "../../utils/formatters";
import {
  LOT_STATUSES,
  getStatusConfig,
  getSeedLevelConfig,
  TEST_RESULTS,
} from "../../constants";
import { toast } from "react-toastify";
import { cn } from "../../lib/utils";

const SeedLotDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Récupération du lot
  const {
    data: seedLot,
    isLoading,
    error,
  } = useQuery<SeedLot>({
    queryKey: ["seed-lot", id],
    queryFn: async () => {
      if (!id) throw new Error("ID manquant");
      const response = await seedLotService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Récupération de la généalogie
  const { data: genealogy, isLoading: genealogyLoading } = useQuery({
    queryKey: ["seed-lot-genealogy", id],
    queryFn: async () => {
      if (!id) throw new Error("ID manquant");
      const response = await seedLotService.getGenealogy(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Récupération des statistiques
  const { data: stats } = useQuery({
    queryKey: ["seed-lot-stats", id],
    queryFn: async () => {
      if (!id) throw new Error("ID manquant");
      const response = await seedLotService.getStats(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Mutation pour la suppression
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID manquant");
      await seedLotService.delete(id);
    },
    onSuccess: () => {
      toast.success("Lot supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["seedLots"] });
      navigate("/dashboard/seed-lots");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erreur lors de la suppression";
      toast.error(message);
    },
  });

  // Mutation pour le changement de statut
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!id) throw new Error("ID manquant");
      return await seedLotService.updateStatus(id, newStatus);
    },
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["seed-lot", id] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Erreur lors de la mise à jour du statut";
      toast.error(message);
    },
  });

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleExportCertificate = async () => {
    if (!id) return;
    try {
      await seedLotService.generateReport(id, "certificate");
      toast.success("Certificat téléchargé avec succès");
    } catch (error) {
      toast.error("Erreur lors du téléchargement du certificat");
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

  const getTestResultBadge = (result: string) => {
    const config = getStatusConfig(result, TEST_RESULTS);
    return (
      <Badge variant={config.variant || "default"} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const calculateDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (daysUntilExpiry: number | null) => {
    if (daysUntilExpiry === null) return null;
    if (daysUntilExpiry < 0) {
      return { color: "text-red-600", icon: XCircle, text: "Expiré" };
    } else if (daysUntilExpiry <= 30) {
      return { color: "text-orange-600", icon: AlertTriangle, text: `Expire dans ${daysUntilExpiry} jours` };
    } else if (daysUntilExpiry <= 90) {
      return { color: "text-yellow-600", icon: Clock, text: `Expire dans ${daysUntilExpiry} jours` };
    } else {
      return { color: "text-green-600", icon: CheckCircle, text: `Valide (${daysUntilExpiry} jours)` };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Chargement du lot de semences...
          </p>
        </div>
      </div>
    );
  }

  if (error || !seedLot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">
            Impossible de charger les informations du lot de semences
          </p>
          <Button
            onClick={() => navigate("/dashboard/seed-lots")}
            variant="outline"
          >
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = calculateDaysUntilExpiry(seedLot.expiryDate);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);
  const availableQuantity = seedLot.availableQuantity || seedLot.quantity;
  const quantityUsedPercentage = ((seedLot.quantity - availableQuantity) / seedLot.quantity) * 100;

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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
            <div className="flex items-center gap-3 mt-1">
              {getLevelBadge(seedLot.level)}
              {getStatusBadge(seedLot.status)}
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">{formatNumber(seedLot.quantity)} kg</span>
              {seedLot.batchNumber && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    Lot #{seedLot.batchNumber}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowQRModal(true)}>
                  <QrCode className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Générer QR Code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Imprimer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" onClick={handleExportCertificate}>
            <Download className="h-4 w-4 mr-2" />
            Certificat
          </Button>
          
          {/* Menu d'actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <MoreVertical className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions sur le lot</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/seed-lots/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/seed-lots/${id}/transfer`}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Transférer
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/seed-lots/create?parentId=${id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer lot enfant
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/quality-controls/create?lotId=${id}`}>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Nouveau contrôle qualité
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
              {LOT_STATUSES.filter(s => s.value !== seedLot.status).map(status => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                >
                  <Badge
                    variant="outline"
                    className={cn("mr-2", status.color)}
                  >
                    {status.label}
                  </Badge>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alertes */}
      {expiryStatus && (expiryStatus.color === "text-red-600" || expiryStatus.color === "text-orange-600") && (
        <Alert variant={expiryStatus.color === "text-red-600" ? "destructive" : "default"}>
          <expiryStatus.icon className="h-4 w-4" />
          <AlertTitle>
            {expiryStatus.color === "text-red-600" ? "Lot expiré" : "Attention"}
          </AlertTitle>
          <AlertDescription>
            {expiryStatus.text}
            {expiryStatus.color === "text-orange-600" && 
              " - Pensez à planifier le renouvellement de ce lot."}
          </AlertDescription>
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Quantité totale
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(seedLot.quantity)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Quantité disponible
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(availableQuantity)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                </p>
                <Progress value={100 - quantityUsedPercentage} className="h-1 mt-2" />
              </div>
              <Package className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date de production
                </p>
                <p className="text-lg font-semibold">
                  {formatDate(seedLot.productionDate)}
                </p>
                {expiryStatus && (
                  <div className={cn("flex items-center gap-1 mt-1", expiryStatus.color)}>
                    <expiryStatus.icon className="h-3 w-3" />
                    <span className="text-xs">{expiryStatus.text}</span>
                  </div>
                )}
              </div>
              <Calendar className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contrôles qualité
                </p>
                <p className="text-2xl font-bold">
                  {stats?.totalQualityControls || 0}
                </p>
                {stats?.passedQualityControls !== undefined && (
                  <p className="text-xs text-green-600">
                    {stats.passedQualityControls} réussis
                  </p>
                )}
              </div>
              <FlaskConical className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs avec contenu détaillé */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Informations</TabsTrigger>
          <TabsTrigger value="genealogy">Généalogie</TabsTrigger>
          <TabsTrigger value="quality">Contrôles Qualité</TabsTrigger>
          <TabsTrigger value="productions">Productions</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Tab Informations */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations du lot */}
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
                      <p className="mt-1 text-sm whitespace-pre-wrap">{seedLot.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Variété et acteurs */}
            <Card>
              <CardHeader>
                <CardTitle>Variété et acteurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {seedLot.variety && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Variété
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">{seedLot.variety.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Code: {seedLot.variety.code}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/dashboard/varieties/${seedLot.variety.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {seedLot.multiplier && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Multiplicateur
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{seedLot.multiplier.name}</p>
                          {seedLot.multiplier.address && (
                            <p className="text-sm text-muted-foreground">
                              {seedLot.multiplier.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/dashboard/multipliers/${seedLot.multiplier.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {seedLot.parcel && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Parcelle de production
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="font-medium">
                            {seedLot.parcel.name || `Parcelle ${seedLot.parcel.code}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {seedLot.parcel.area} ha
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/dashboard/parcels/${seedLot.parcel.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Créé le</label>
                    <p>{formatDateTime(seedLot.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Modifié le</label>
                    <p>{formatDateTime(seedLot.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques supplémentaires */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Statistiques du lot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{stats.totalChildLots || 0}</p>
                    <p className="text-sm text-muted-foreground">Lots dérivés</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{stats.totalProductions || 0}</p>
                    <p className="text-sm text-muted-foreground">Productions</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {formatNumber(stats.quantityInChildren || 0)} kg
                    </p>
                    <p className="text-sm text-muted-foreground">Dans les lots enfants</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.qualityStatus || "Non testé"}
                    </p>
                    <p className="text-sm text-muted-foreground">Dernier contrôle</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Généalogie */}
        <TabsContent value="genealogy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="h-5 w-5 mr-2" />
                Généalogie du lot
              </CardTitle>
              <CardDescription>
                Relations parent-enfant et traçabilité complète
              </CardDescription>
            </CardHeader>
            <CardContent>
              {genealogyLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Chargement de la généalogie...
                  </p>
                </div>
              ) : genealogy ? (
                <div className="space-y-6">
                  {/* Lot parent */}
                  {seedLot.parentLot && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Lot parent
                      </h4>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Package className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-mono font-medium">
                                {seedLot.parentLot.id}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {seedLot.parentLot.level}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {seedLot.parentLot.variety?.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  • {formatNumber(seedLot.parentLot.quantity)} kg
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/dashboard/seed-lots/${seedLot.parentLot.id}`}>
                              Voir détails
                              <Eye className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lot actuel */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Lot actuel
                    </h4>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-500">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-mono font-medium text-lg">{seedLot.id}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getLevelBadge(seedLot.level)}
                            {getStatusBadge(seedLot.status)}
                            <span className="text-sm">
                              • {formatNumber(seedLot.quantity)} kg
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lots enfants */}
                  {seedLot.childLots && seedLot.childLots.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Lots dérivés ({seedLot.childLots.length})
                      </h4>
                      <div className="space-y-2">
                        {seedLot.childLots.map((childLot) => (
                          <div
                            key={childLot.id}
                            className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Package className="h-5 w-5 text-purple-600" />
                                <div>
                                  <p className="font-mono font-medium">
                                    {childLot.id}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {childLot.level}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {childLot.variety?.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      • {formatNumber(childLot.quantity)} kg
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      • {formatDate(childLot.productionDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/dashboard/seed-lots/${childLot.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!seedLot.parentLot && (!seedLot.childLots || seedLot.childLots.length === 0) && (
                    <div className="text-center py-12">
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
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Erreur lors du chargement de la généalogie
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Contrôles Qualité */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2" />
                  Contrôles qualité
                </div>
                <Button asChild>
                  <Link to={`/dashboard/quality-controls/create?lotId=${id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau contrôle
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Historique des tests et certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seedLot.qualityControls && seedLot.qualityControls.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Germination</TableHead>
                        <TableHead>Pureté</TableHead>
                        <TableHead>Humidité</TableHead>
                        <TableHead>Santé</TableHead>
                        <TableHead>Résultat</TableHead>
                        <TableHead>Inspecteur</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seedLot.qualityControls.map((control: QualityControl) => (
                        <TableRow key={control.id}>
                          <TableCell>{formatDate(control.controlDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{control.germinationRate}%</span>
                              {control.germinationRate >= 90 && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {control.germinationRate < 80 && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{control.varietyPurity}%</span>
                              {control.varietyPurity >= 95 && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {control.moistureContent ? `${control.moistureContent}%` : "-"}
                          </TableCell>
                          <TableCell>
                            {control.seedHealth ? `${control.seedHealth}%` : "-"}
                          </TableCell>
                          <TableCell>
                            {getTestResultBadge(control.result)}
                          </TableCell>
                          <TableCell>
                            {control.inspector?.name || "Non spécifié"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/dashboard/quality-controls/${control.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir détails
                                  </Link>
                                </DropdownMenuItem>
                                {control.certificateUrl && (
                                  <DropdownMenuItem asChild>
                                    
                                      href={control.certificateUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Certificat
                                    </a>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Résumé des contrôles */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Résumé des contrôles</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold">{seedLot.qualityControls.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Réussis</p>
                        <p className="font-semibold text-green-600">
                          {seedLot.qualityControls.filter(qc => qc.result === "pass").length}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Échoués</p>
                        <p className="font-semibold text-red-600">
                          {seedLot.qualityControls.filter(qc => qc.result === "fail").length}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dernier contrôle</p>
                        <p className="font-semibold">
                          {formatDate(seedLot.qualityControls[0].controlDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun contrôle qualité
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Aucun test de qualité n'a encore été effectué sur ce lot.
                  </p>
                  <Button asChild>
                    <Link to={`/dashboard/quality-controls/create?lotId=${id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Premier contrôle
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Productions */}
        <TabsContent value="productions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Productions associées
                </div>
                <Button asChild>
                  <Link to={`/dashboard/productions/create?lotId=${id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle production
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Historique des productions utilisant ce lot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seedLot.productions && seedLot.productions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Parcelle</TableHead>
                      <TableHead>Multiplicateur</TableHead>
                      <TableHead>Quantité planifiée</TableHead>
                      <TableHead>Rendement réel</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seedLot.productions.map((production: Production) => (
                      <TableRow key={production.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {formatDate(production.startDate)}
                            </p>
                            {production.endDate && (
                              <p className="text-sm text-muted-foreground">
                                au {formatDate(production.endDate)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {production.parcel?.name || `Parcelle ${production.parcel?.code}`}
                        </TableCell>
                        <TableCell>{production.multiplier?.name}</TableCell>
                        <TableCell>
                          {production.plannedQuantity
                            ? `${formatNumber(production.plannedQuantity)} kg`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {production.actualYield
                            ? `${formatNumber(production.actualYield)} t/ha`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              production.status === "completed"
                                ? "default"
                                : production.status === "in-progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {production.status === "planned" && "Planifiée"}
                            {production.status === "in-progress" && "En cours"}
                            {production.status === "completed" && "Terminée"}
                            {production.status === "cancelled" && "Annulée"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/dashboard/productions/${production.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune production
                  </h3>
                  <p className="text-muted-foreground">
                    Ce lot n'a pas encore été utilisé dans une production.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Historique */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Historique et mouvements
              </CardTitle>
              <CardDescription>
                Traçabilité complète des actions sur ce lot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Fonctionnalité en développement
                </h3>
                <p className="text-muted-foreground">
                  L'historique complet des mouvements sera bientôt disponible.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        seedLot={seedLot}
      />

      <DeleteSeedLotDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        seedLotId={seedLot.id}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default SeedLotDetail;