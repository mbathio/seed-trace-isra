// frontend/src/pages/parcels/CreateParcel.tsx - VERSION COMPLÈTE AVEC CARTE
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, MapPin, Map, List } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import { Multiplier } from "../../types/entities";
import { ApiResponse } from "../../types/api";
import { PARCEL_STATUSES, SENEGAL_BOUNDS } from "../../constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { parcelValidationSchema } from "../../utils/validators";
import { LocationPicker } from "../../components/map/LocationPicker";

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
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateParcelForm>({
    resolver: yupResolver(parcelValidationSchema),
    defaultValues: {
      name: "", // <—
      area: 0,
      status: "available",
      soilType: "none", // <—
      irrigationSystem: "none", // <—
      address: "", // <—
      multiplierId: undefined,
      latitude: null as any, // <— garde null/'' tant que tu n’as pas de GPS
      longitude: null as any,
    },
  });

  // ✅ Détection automatique de la position GPS
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setValue("latitude", latitude);
          setValue("longitude", longitude);
          setGeoMessage(
            `📍 Position détectée automatiquement (±${Math.round(accuracy)} m)`
          );
        },
        (error) => {
          console.warn("Erreur de géolocalisation:", error);
          setGeoMessage("⚠️ Impossible d’obtenir votre position actuelle");
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // laisse plus de temps pour le GPS
          maximumAge: 0, // interdit les positions mises en cache
        }
      );
    } else {
      setGeoMessage("⚠️ Géolocalisation non supportée par ce navigateur");
    }
  }, [setValue]);
  const [localisationMethod, setLocalisationMethod] = useState<
    "map" | "manual"
  >("map");

  // Surveiller les valeurs actuelles
  const watchedLatitude = watch("latitude");
  const watchedLongitude = watch("longitude");

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
      const response = await api.post("/parcels", data);
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

  const onSubmit: SubmitHandler<CreateParcelForm> = async (data) => {
    setIsSubmitting(true);

    // 1) Normalisation & coercition forte des types attendus par l’API
    const cleanedData: CreateParcelForm = {
      ...data,
      area: Number(data.area ?? 0),
      latitude:
        data.latitude === null || data.latitude === ("" as any)
          ? 0
          : Number(data.latitude),
      longitude:
        data.longitude === null || data.longitude === ("" as any)
          ? 0
          : Number(data.longitude),
      multiplierId:
        data.multiplierId === undefined || data.multiplierId === null
          ? undefined
          : Number(data.multiplierId),
      soilType: data.soilType === "none" ? undefined : data.soilType,
      irrigationSystem:
        data.irrigationSystem === "none" ? undefined : data.irrigationSystem,
      name: data.name?.trim() || undefined,
      address: data.address?.trim() || undefined,
    };

    // 2) Garde-fous UX (facultatifs mais utiles)
    if (!cleanedData.area || cleanedData.area <= 0) {
      toast.error("La superficie doit être un nombre positif.");
      setIsSubmitting(false);
      return;
    }
    if (
      typeof cleanedData.latitude !== "number" ||
      typeof cleanedData.longitude !== "number" ||
      Number.isNaN(cleanedData.latitude) ||
      Number.isNaN(cleanedData.longitude)
    ) {
      toast.error("Coordonnées GPS invalides.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 3) Appel mutation (déjà déclarée plus haut)
      await createMutation.mutateAsync(cleanedData);
    } catch (err: any) {
      // 4) Gestion d’erreurs backend, avec focus sur 422
      const status = err?.response?.status;
      if (status === 422) {
        // Plusieurs API renvoient { message, errors } où errors = array|object
        const apiMsg =
          err?.response?.data?.message ||
          "Données invalides. Veuillez corriger le formulaire.";
        const apiErrors = err?.response?.data?.errors;

        // Construit un message lisible si on a des détails champ->erreur
        let details = "";
        if (Array.isArray(apiErrors)) {
          details = apiErrors
            .map((e: any) =>
              typeof e === "string"
                ? `• ${e}`
                : e?.path && e?.message
                ? `• ${e.path}: ${e.message}`
                : null
            )
            .filter(Boolean)
            .join("\n");
        } else if (apiErrors && typeof apiErrors === "object") {
          details = Object.entries(apiErrors)
            .map(([k, v]: [string, any]) => {
              const msg = Array.isArray(v) ? v.join(", ") : String(v);
              return `• ${k}: ${msg}`;
            })
            .join("\n");
        }

        toast.error(details ? `${apiMsg}\n${details}` : apiMsg);
      } else {
        const fallback =
          err?.response?.data?.message ||
          err?.message ||
          "Erreur lors de la création de la parcelle";
        toast.error(fallback);
      }
      console.error("POST /parcels failed:", err);
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
                      value={field.value?.toString() || "none"}
                      onValueChange={(value) =>
                        field.onChange(
                          value === "none" ? undefined : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un multiplicateur (optionnel)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          Aucun multiplicateur
                        </SelectItem>
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
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type de sol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Non spécifié</SelectItem>
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
                      value={field.value || "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un système d'irrigation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Non spécifié</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Village, Commune, Région"
                      value={field.value ?? ""} // <—
                      onChange={(e) => {
                        // <—
                        const val = e.target.value;
                        field.onChange(val); // <— string, pas event
                        if (localisationMethod === "manual") {
                          handleAddressChange(val);
                        }
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
                La position sera détectée automatiquement, mais vous pouvez
                aussi ajuster manuellement sur la carte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ✅ Détection automatique de la position */}
              {geoMessage && (
                <p className="text-sm mb-2 text-blue-600">{geoMessage}</p>
              )}

              {/* ✅ Champs de coordonnées préremplis */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={field.value ?? ""} // <— pas de toFixed ici
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? null : parseFloat(v)); // <— reste contrôlé
                        }}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={field.value ?? ""} // <—
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? null : parseFloat(v)); // <—
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              {/* ✅ Carte Mapbox liée */}
              {watchedLatitude && watchedLongitude ? (
                <LocationPicker
                  latitude={watchedLatitude}
                  longitude={watchedLongitude}
                  onChange={({ latitude, longitude }) => {
                    setValue("latitude", latitude);
                    setValue("longitude", longitude);
                  }}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  📡 Détection de la position en cours...
                </p>
              )}
              {/* ✅ Affichage lisible des coordonnées */}
              <p className="text-sm text-green-700 mt-2">
                Latitude :{" "}
                {watchedLatitude != null
                  ? Number(watchedLatitude).toFixed(6)
                  : "—"}{" "}
                | Longitude :{" "}
                {watchedLongitude != null
                  ? Number(watchedLongitude).toFixed(6)
                  : "—"}
              </p>

              {/* ✅ Affichage des coordonnées */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Position actuelle :
                </p>
                <p className="text-sm text-green-700">
                  Latitude : {watchedLatitude?.toFixed(6)} | Longitude :{" "}
                  {watchedLongitude?.toFixed(6)}
                </p>
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
