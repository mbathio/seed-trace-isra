// frontend/src/pages/parcels/CreateParcel.tsx - PAGE DE CRÉATION PARCELLE
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import { Multiplier } from "../../types/entities";
import { ApiResponse } from "../../types/api";
import { PARCEL_STATUSES, SENEGAL_BOUNDS } from "../../constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { parcelValidationSchema } from "../../utils/validators";
import { DataTransformer } from "../../utils/transformers";

interface CreateParcelForm {
  name?: string;
  area: number;
  latitude: number;
  longitude: number;
  status: "available" | "in-use" | "resting";
  soilType?: string;
  irrigationSystem?: string;
  address?: string;
  multiplierId?: number;
}

const CreateParcel: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateParcelForm>({
    resolver: yupResolver(parcelValidationSchema),
    defaultValues: {
      status: "available",
      area: 0,
      latitude: SENEGAL_BOUNDS.CENTER.lat,
      longitude: SENEGAL_BOUNDS.CENTER.lng,
    },
  });

  // Récupération des multiplicateurs pour assignation
  const { data: multipliersResponse } = useQuery<ApiResponse<Multiplier[]>>({
    queryKey: ["multipliers-for-parcel"],
    queryFn: async () => {
      const response = await api.get("/multipliers", {
        params: { status: "active", pageSize: 100 },
      });
      return response.data;
    },
  });

  const multipliers = multipliersResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: CreateParcelForm) => {
      // Transformer les données pour l'API
      const transformedData = DataTransformer.transformParcelForAPI(data);
      const response = await api.post("/parcels", transformedData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Parcelle créée avec succès !");
      navigate(`/dashboard/parcels/${data.data.id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de la création de la parcelle";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: CreateParcelForm) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour obtenir les coordonnées approximatives d'une adresse (simulation)
  const handleAddressChange = (address: string) => {
    if (address.toLowerCase().includes("dakar")) {
      setValue("latitude", 14.7167);
      setValue("longitude", -17.4677);
    } else if (address.toLowerCase().includes("saint-louis")) {
      setValue("latitude", 16.0469);
      setValue("longitude", -16.4626);
    } else if (address.toLowerCase().includes("thiès")) {
      setValue("latitude", 14.7886);
      setValue("longitude", -16.9352);
    } else if (address.toLowerCase().includes("kaolack")) {
      setValue("latitude", 14.1483);
      setValue("longitude", -16.0725);
    } else if (address.toLowerCase().includes("ziguinchor")) {
      setValue("latitude", 12.5681);
      setValue("longitude", -16.2735);
    }
  };

  // Types de sol couramment trouvés au Sénégal
  const soilTypes = [
    "Argilo-limoneux",
    "Sableux",
    "Limono-sableux",
    "Argilo-sableux",
    "Argileux",
    "Limoneux",
    "Sablo-argileux",
    "Latéritique",
    "Vertisol",
    "Ferralsol",
  ];

  // Systèmes d'irrigation
  const irrigationSystems = [
    "Goutte à goutte",
    "Aspersion",
    "Submersion",
    "Irrigation gravitaire",
    "Pivot central",
    "Micro-aspersion",
    "Irrigation localisée",
    "Canal d'irrigation",
    "Pompage",
    "Pluvial (sans irrigation)",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/parcels")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <MapPin className="h-8 w-8 mr-3 text-green-600" />
            Nouvelle parcelle
          </h1>
          <p className="text-muted-foreground">
            Ajouter une nouvelle parcelle pour la production de semences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Détails d'identification de la parcelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la parcelle</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="ex: Parcelle Nord, Champ A1..."
                      {...field}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Optionnel - Un nom sera automatiquement généré si non spécifié
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Superficie (hectares) *</Label>
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1000"
                      placeholder="2.5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.area && (
                  <p className="text-sm text-red-500">{errors.area.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut initial *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARCEL_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiplierId">Multiplicateur responsable</Label>
                <Controller
                  name="multiplierId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un multiplicateur (optionnel)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun multiplicateur</SelectItem>
                        {multipliers.map((multiplier) => (
                          <SelectItem
                            key={multiplier.id}
                            value={multiplier.id.toString()}
                          >
                            {multiplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.multiplierId && (
                  <p className="text-sm text-red-500">
                    {errors.multiplierId.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques du sol */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques du sol</CardTitle>
              <CardDescription>
                Propriétés physiques et système d'irrigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="soilType">Type de sol</Label>
                <Controller
                  name="soilType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type de sol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Non spécifié</SelectItem>
                        {soilTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.soilType && (
                  <p className="text-sm text-red-500">
                    {errors.soilType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigationSystem">Système d'irrigation</Label>
                <Controller
                  name="irrigationSystem"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un système d'irrigation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Non spécifié</SelectItem>
                        {irrigationSystems.map((system) => (
                          <SelectItem key={system} value={system}>
                            {system}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.irrigationSystem && (
                  <p className="text-sm text-red-500">
                    {errors.irrigationSystem.message}
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Conseil</h4>
                <p className="text-sm text-blue-700">
                  Une analyse de sol peut être effectuée après la création de la
                  parcelle pour obtenir des données précises sur la composition
                  chimique.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Localisation géographique</CardTitle>
              <CardDescription>
                Adresse et coordonnées GPS de la parcelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Village, Commune, Région"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleAddressChange(e.target.value);
                      }}
                    />
                  )}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        min={SENEGAL_BOUNDS.LAT_MIN}
                        max={SENEGAL_BOUNDS.LAT_MAX}
                        placeholder="14.7167"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    )}
                  />
                  {errors.latitude && (
                    <p className="text-sm text-red-500">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        min={SENEGAL_BOUNDS.LNG_MIN}
                        max={SENEGAL_BOUNDS.LNG_MAX}
                        placeholder="-17.4677"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    )}
                  />
                  {errors.longitude && (
                    <p className="text-sm text-red-500">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Limites Sénégal:</strong>
                  <br />
                  Lat: {SENEGAL_BOUNDS.LAT_MIN} à {SENEGAL_BOUNDS.LAT_MAX}
                  <br />
                  Lng: {SENEGAL_BOUNDS.LNG_MIN} à {SENEGAL_BOUNDS.LNG_MAX}
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Astuce:</strong>
                  <br />
                  Tapez le nom d'une ville dans l'adresse pour une approximation
                  automatique des coordonnées
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Aide:</strong>
                  <br />
                  Utilisez Google Maps ou GPS pour obtenir les coordonnées
                  précises
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/parcels")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Créer la parcelle
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateParcel;
