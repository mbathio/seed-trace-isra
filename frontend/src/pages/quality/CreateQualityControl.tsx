// frontend/src/pages/quality/CreateQualityControl.tsx - PAGE DE CRÉATION CONTRÔLE QUALITÉ
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, FlaskConical, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import { SeedLot } from "../../types/entities";
import { ApiResponse } from "../../types/api";
import { yupResolver } from "@hookform/resolvers/yup";
import { qualityControlValidationSchema } from "../../utils/validators";

interface CreateQualityControlForm {
  lotId: string;
  controlDate: string;
  germinationRate: number;
  varietyPurity: number;
  moistureContent?: number;
  seedHealth?: number;
  observations?: string;
  testMethod?: string;
  laboratoryRef?: string;
}

const CreateQualityControl: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lotSearch, setLotSearch] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateQualityControlForm>({
    resolver: yupResolver(qualityControlValidationSchema),
    defaultValues: {
      controlDate: new Date().toISOString().split("T")[0],
      germinationRate: 0,
      varietyPurity: 0,
    },
  });

  const selectedLotId = watch("lotId");

  // Recherche des lots de semences
  const { data: seedLotsResponse, isLoading: lotsLoading } = useQuery<
    ApiResponse<SeedLot[]>
  >({
    queryKey: ["seed-lots-for-quality", lotSearch],
    queryFn: async () => {
      const response = await api.get("/seed-lots", {
        params: {
          search: lotSearch || undefined,
          status: "active,in-stock",
          pageSize: 20,
        },
      });
      return response.data;
    },
    enabled: lotSearch.length >= 2,
  });

  // Détails du lot sélectionné
  const { data: selectedLot } = useQuery<SeedLot>({
    queryKey: ["seed-lot", selectedLotId],
    queryFn: async () => {
      const response = await api.get(`/seed-lots/${selectedLotId}`);
      return response.data.data;
    },
    enabled: !!selectedLotId,
  });

  const seedLots = seedLotsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: CreateQualityControlForm) => {
      const response = await api.post("/quality-controls", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Contrôle qualité créé avec succès !");
      navigate(`/dashboard/quality-controls/${data.data.id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de la création du contrôle qualité";
      toast.error(errorMessage);
    },
  });

  const onSubmit: SubmitHandler<CreateQualityControlForm> = async (data) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Méthodes de test courantes
  const testMethods = [
    "Test de germination ISTA",
    "Analyse variétale par marqueurs",
    "Test d'humidité standard",
    "Analyse phytosanitaire",
    "Test de viabilité par TTC",
    "Analyse par électrophorèse",
    "Test de pureté physique",
    "Autre méthode",
  ];

  // Calcul automatique du résultat basé sur les seuils
  const germinationRate = watch("germinationRate");
  const varietyPurity = watch("varietyPurity");

  const getQualityResult = () => {
    if (!selectedLot || !germinationRate || !varietyPurity) return null;

    const thresholds = {
      GO: { germination: 98, purity: 99.9 },
      G1: { germination: 95, purity: 99.5 },
      G2: { germination: 90, purity: 99.0 },
      G3: { germination: 85, purity: 98.0 },
      G4: { germination: 80, purity: 97.0 },
      R1: { germination: 80, purity: 97.0 },
      R2: { germination: 80, purity: 95.0 },
    };

    const threshold =
      thresholds[selectedLot.level as keyof typeof thresholds] || thresholds.R2;

    return germinationRate >= threshold.germination &&
      varietyPurity >= threshold.purity
      ? "RÉUSSI"
      : "ÉCHEC";
  };

  const qualityResult = getQualityResult();

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Nouveau contrôle qualité
          </h1>
          <p className="text-muted-foreground">
            Effectuer un contrôle qualité sur un lot de semences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sélection du lot */}
          <Card>
            <CardHeader>
              <CardTitle>Lot à tester</CardTitle>
              <CardDescription>
                Sélectionnez le lot de semences à contrôler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rechercher un lot</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Code du lot, variété..."
                    value={lotSearch}
                    onChange={(e) => setLotSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lotId">Lot de semences *</Label>
                <Controller
                  name="lotId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un lot" />
                      </SelectTrigger>
                      <SelectContent>
                        {lotsLoading ? (
                          <SelectItem value="" disabled>
                            Recherche en cours...
                          </SelectItem>
                        ) : seedLots.length > 0 ? (
                          seedLots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              <div className="flex flex-col">
                                <span className="font-mono">{lot.id}</span>
                                <span className="text-xs text-muted-foreground">
                                  {lot.variety.name} - {lot.level} -{" "}
                                  {lot.quantity}kg
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : lotSearch.length >= 2 ? (
                          <SelectItem value="" disabled>
                            Aucun lot trouvé
                          </SelectItem>
                        ) : (
                          <SelectItem value="" disabled>
                            Tapez au moins 2 caractères pour rechercher
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.lotId && (
                  <p className="text-sm text-red-500">{errors.lotId.message}</p>
                )}
              </div>

              {selectedLot && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Lot sélectionné
                  </h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      <strong>Variété:</strong> {selectedLot.variety.name}
                    </p>
                    <p>
                      <strong>Niveau:</strong> {selectedLot.level}
                    </p>
                    <p>
                      <strong>Quantité:</strong> {selectedLot.quantity} kg
                    </p>
                    <p>
                      <strong>Production:</strong>{" "}
                      {new Date(
                        selectedLot.productionDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations du test */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du test</CardTitle>
              <CardDescription>Date et méthode de contrôle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="controlDate">Date du contrôle *</Label>
                <Controller
                  name="controlDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      {...field}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  )}
                />
                {errors.controlDate && (
                  <p className="text-sm text-red-500">
                    {errors.controlDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="testMethod">Méthode de test</Label>
                <Controller
                  name="testMethod"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une méthode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Non spécifiée</SelectItem>
                        {testMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratoryRef">Référence laboratoire</Label>
                <Controller
                  name="laboratoryRef"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: LAB-2024-001" {...field} />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Résultats des tests */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Résultats des tests</CardTitle>
              <CardDescription>
                Saisissez les résultats obtenus lors des analyses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="germinationRate">
                    Taux de germination (%) *
                  </Label>
                  <Controller
                    name="germinationRate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="85.5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    )}
                  />
                  {errors.germinationRate && (
                    <p className="text-sm text-red-500">
                      {errors.germinationRate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="varietyPurity">Pureté variétale (%) *</Label>
                  <Controller
                    name="varietyPurity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="98.5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    )}
                  />
                  {errors.varietyPurity && (
                    <p className="text-sm text-red-500">
                      {errors.varietyPurity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moistureContent">Taux d'humidité (%)</Label>
                  <Controller
                    name="moistureContent"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="12.5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seedHealth">État sanitaire (%)</Label>
                  <Controller
                    name="seedHealth"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="95.0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    )}
                  />
                </div>
              </div>

              {/* Résultat automatique */}
              {qualityResult && selectedLot && (
                <div
                  className={`p-4 rounded-lg ${
                    qualityResult === "RÉUSSI" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <h4
                    className={`font-medium mb-2 ${
                      qualityResult === "RÉUSSI"
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    Résultat préliminaire: {qualityResult}
                  </h4>
                  <p
                    className={`text-sm ${
                      qualityResult === "RÉUSSI"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    Basé sur les seuils pour le niveau {selectedLot.level}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observations">Observations</Label>
                <Controller
                  name="observations"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Commentaires, observations particulières, recommandations..."
                      rows={4}
                      {...field}
                    />
                  )}
                />
                {errors.observations && (
                  <p className="text-sm text-red-500">
                    {errors.observations.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/quality-controls")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Créer le contrôle
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateQualityControl;
