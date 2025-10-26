import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  FileText,
  FlaskConical,
  User,
  CheckCircle,
  XCircle,
  Download,
  Package,
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
import { Progress } from "../../components/ui/progress";
import { api } from "../../services/api";
import type { QualityControl } from "../../types/entities";
import { formatDate, formatNumber } from "../../utils/formatters";
import { QUALITY_TEST_RESULTS, getStatusConfig } from "../../constants";
import { toast } from "react-toastify"; // pour message utilisateur

const fileInputRef = React.createRef<HTMLInputElement>();

const QualityControlDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: qualityControl,
    isLoading,
    error,
  } = useQuery<QualityControl>({
    queryKey: ["quality-control", id],
    queryFn: async () => {
      const response = await api.get(`/quality-controls/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const getResultBadge = (result: string) => {
    const config = getStatusConfig(result, QUALITY_TEST_RESULTS);
    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };

    const colorClass =
      colorClasses[config.color as keyof typeof colorClasses] ||
      colorClasses.green;

    return (
      <Badge className={`${colorClass} font-medium`}>{config.label}</Badge>
    );
  };

  // Fonction pour obtenir les seuils selon le niveau
  const getThresholds = (level: string) => {
    const thresholds: Record<string, { germination: number; purity: number }> =
      {
        GO: { germination: 98, purity: 99.9 },
        G1: { germination: 95, purity: 99.5 },
        G2: { germination: 90, purity: 99.0 },
        G3: { germination: 85, purity: 98.0 },
        G4: { germination: 80, purity: 97.0 },
        R1: { germination: 80, purity: 97.0 },
        R2: { germination: 80, purity: 95.0 },
      };
    return thresholds[level] || thresholds.R2;
  };
  // ✅ Fonction de gestion du clic sur le bouton Certificat
  const handleCertificateClick = () => {
    if (qualityControl?.certificateUrl) {
      const link = document.createElement("a");
      link.href = `${import.meta.env.VITE_API_URL.replace("/api", "")}${
        qualityControl.certificateUrl
      }`;

      link.download = `certificat-${qualityControl.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      fileInputRef.current?.click();
    }
  };

  // ✅ Upload du fichier PDF
  const handleCertificateUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("certificate", file);

    try {
      // ✅ Récupère le bon token JWT stocké
      const token = localStorage.getItem("accessToken");

      // ✅ Construction des headers
      const headers: Record<string, string> = {
        "Content-Type": "multipart/form-data",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // ✅ Appel API avec authentification
      await api.post(
        `/quality-controls/${qualityControl?.id}/certificate`,
        formData,
        {
          headers,
          withCredentials: true,
        }
      );

      toast.success("✅ Certificat uploadé avec succès !");
      window.location.reload();
    } catch (error) {
      toast.error("❌ Erreur lors de l’upload du certificat");
      console.error(error);
    }
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

  if (error || !qualityControl) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement du contrôle qualité
        </p>
        <Button
          onClick={() => navigate("/dashboard/quality-controls")}
          className="mt-4"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  const thresholds = getThresholds(qualityControl.seedLot.level);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/quality-controls")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FlaskConical className="h-8 w-8 mr-3 text-purple-600" />
              Contrôle qualité #{qualityControl.id}
            </h1>
            <p className="text-muted-foreground">
              {getResultBadge(qualityControl.result)} •{" "}
              {formatDate(qualityControl.controlDate)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCertificateClick}>
            <Download className="h-4 w-4 mr-2" />
            {qualityControl.certificateUrl
              ? "Télécharger certificat"
              : "Uploader certificat"}
          </Button>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleCertificateUpload}
            style={{ display: "none" }}
          />
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations du test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Lot testé
                </label>
                <Link
                  to={`/dashboard/seed-lots/${qualityControl.lotId}`}
                  className="font-mono text-blue-600 hover:underline block"
                >
                  {qualityControl.lotId}
                </Link>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date du contrôle
                </label>
                <p className="font-medium">
                  {formatDate(qualityControl.controlDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Résultat
                </label>
                <p>{getResultBadge(qualityControl.result)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Méthode
                </label>
                <p className="font-medium">
                  {qualityControl.testMethod || "Non spécifiée"}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Inspecteur
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {qualityControl.inspector.name}
                </span>
              </div>
            </div>

            {qualityControl.laboratoryRef && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Référence laboratoire
                </label>
                <p className="font-mono text-sm">
                  {qualityControl.laboratoryRef}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résultats des tests</CardTitle>
            <CardDescription>
              Niveau {qualityControl.seedLot.level} - Seuils: Germination{" "}
              {thresholds.germination}%, Pureté {thresholds.purity}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Taux de germination */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">
                    Taux de germination
                  </label>
                  <span
                    className={`text-xl font-bold ${
                      qualityControl.germinationRate >= thresholds.germination
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {qualityControl.germinationRate}%
                  </span>
                </div>
                <Progress
                  value={qualityControl.germinationRate}
                  className={`h-2 ${
                    qualityControl.germinationRate >= thresholds.germination
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seuil minimum: {thresholds.germination}%
                </p>
              </div>

              {/* Pureté variétale */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">
                    Pureté variétale
                  </label>
                  <span
                    className={`text-xl font-bold ${
                      qualityControl.varietyPurity >= thresholds.purity
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {qualityControl.varietyPurity}%
                  </span>
                </div>
                <Progress
                  value={qualityControl.varietyPurity}
                  className={`h-2 ${
                    qualityControl.varietyPurity >= thresholds.purity
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seuil minimum: {thresholds.purity}%
                </p>
              </div>

              {/* Autres tests optionnels */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {qualityControl.moistureContent !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Taux d'humidité
                    </label>
                    <p className="text-lg font-bold text-orange-600">
                      {qualityControl.moistureContent}%
                    </p>
                  </div>
                )}
                {qualityControl.seedHealth !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      État sanitaire
                    </label>
                    <p className="text-lg font-bold text-purple-600">
                      {qualityControl.seedHealth}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-4">
              {qualityControl.result === "pass" ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {qualityControl.result === "pass"
                    ? "Lot certifié conforme"
                    : "Lot non conforme"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Selon les standards de qualité ISRA pour le niveau{" "}
                  {qualityControl.seedLot.level}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observations */}
      {qualityControl.observations && (
        <Card>
          <CardHeader>
            <CardTitle>Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {qualityControl.observations}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informations sur le lot */}
      {qualityControl.seedLot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Informations sur le lot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Variété
                </label>
                <p className="font-medium">
                  {qualityControl.seedLot.variety.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Niveau
                </label>
                <Badge variant="outline">{qualityControl.seedLot.level}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Quantité
                </label>
                <p className="font-medium">
                  {formatNumber(qualityControl.seedLot.quantity)} kg
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Production
                </label>
                <p className="font-medium">
                  {formatDate(qualityControl.seedLot.productionDate)}
                </p>
              </div>
              {qualityControl.seedLot.multiplier && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Multiplicateur
                  </label>
                  <Link
                    to={`/dashboard/multipliers/${qualityControl.seedLot.multiplier.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {qualityControl.seedLot.multiplier.name}
                  </Link>
                </div>
              )}
              {qualityControl.seedLot.parcel && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parcelle
                  </label>
                  <Link
                    to={`/dashboard/parcels/${qualityControl.seedLot.parcel.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {qualityControl.seedLot.parcel.name ||
                      `Parcelle ${qualityControl.seedLot.parcel.id}`}
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificat et documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents et certificats</CardTitle>
          <CardDescription>
            Certificats et documents associés à ce contrôle qualité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityControl.certificateUrl ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Certificat de qualité</p>
                    <p className="text-sm text-muted-foreground">
                      Généré le {formatDate(qualityControl.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_URL.replace("/api", "")}${
                        qualityControl.certificateUrl
                      }`,
                      "_blank"
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Aucun certificat disponible
                </h3>
                <p className="text-muted-foreground mb-4">
                  Le certificat pour ce contrôle qualité n'a pas encore été
                  généré.
                </p>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Générer le certificat
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métadonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Métadonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="text-muted-foreground">Créé le</label>
              <p className="font-medium">
                {formatDate(qualityControl.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-muted-foreground">Modifié le</label>
              <p className="font-medium">
                {formatDate(qualityControl.updatedAt)}
              </p>
            </div>
            <div>
              <label className="text-muted-foreground">ID du contrôle</label>
              <p className="font-mono">{qualityControl.id}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Inspecteur ID</label>
              <p className="font-mono">{qualityControl.inspectorId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityControlDetail;
