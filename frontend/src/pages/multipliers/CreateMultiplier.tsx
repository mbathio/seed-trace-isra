// frontend/src/pages/multipliers/CreateMultiplier.tsx - PAGE DE CRÉATION MULTIPLICATEUR
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Users, MapPin, Star } from "lucide-react";
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
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import {
  MULTIPLIER_STATUSES,
  CERTIFICATION_LEVELS,
  CROP_TYPES,
  SENEGAL_BOUNDS,
} from "../../constants";
import { DataTransformer } from "../../utils/transformers";

interface CreateMultiplierForm {
  name: string;
  status: "active" | "inactive";
  address: string;
  latitude: number;
  longitude: number;
  yearsExperience: number;
  certificationLevel: "beginner" | "intermediate" | "expert";
  specialization: string[];
  phone?: string;
  email?: string;
}

const CreateMultiplier: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ CORRIGÉ: Utilisation du useForm sans resolver Yup pour éviter les conflits de types
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<CreateMultiplierForm>({
    defaultValues: {
      status: "active",
      certificationLevel: "beginner",
      yearsExperience: 0,
      specialization: [],
      latitude: SENEGAL_BOUNDS.CENTER.lat,
      longitude: SENEGAL_BOUNDS.CENTER.lng,
      name: "",
      address: "",
    },
  });

  const specialization = watch("specialization") || [];

  const createMutation = useMutation({
    mutationFn: async (data: CreateMultiplierForm) => {
      // Transformer les données pour l'API
      const transformedData = DataTransformer.transformMultiplierForAPI(data);
      const response = await api.post("/multipliers", transformedData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Multiplicateur créé avec succès !");
      navigate(`/dashboard/multipliers/${data.data.id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de la création du multiplicateur";
      toast.error(errorMessage);
    },
  });

  // ✅ CORRIGÉ: Validation manuelle pour éviter les conflits Yup/TypeScript
  const validateForm = (data: CreateMultiplierForm): boolean => {
    let isValid = true;

    // Validation du nom
    if (!data.name || data.name.trim().length < 2) {
      setError("name", {
        message: "Le nom doit contenir au moins 2 caractères",
      });
      isValid = false;
    } else {
      clearErrors("name");
    }

    // Validation de l'adresse
    if (!data.address || data.address.trim().length < 5) {
      setError("address", {
        message: "L'adresse doit contenir au moins 5 caractères",
      });
      isValid = false;
    } else {
      clearErrors("address");
    }

    // Validation des coordonnées
    if (
      data.latitude < SENEGAL_BOUNDS.LAT_MIN ||
      data.latitude > SENEGAL_BOUNDS.LAT_MAX
    ) {
      setError("latitude", {
        message: `Latitude doit être entre ${SENEGAL_BOUNDS.LAT_MIN} et ${SENEGAL_BOUNDS.LAT_MAX}`,
      });
      isValid = false;
    } else {
      clearErrors("latitude");
    }

    if (
      data.longitude < SENEGAL_BOUNDS.LNG_MIN ||
      data.longitude > SENEGAL_BOUNDS.LNG_MAX
    ) {
      setError("longitude", {
        message: `Longitude doit être entre ${SENEGAL_BOUNDS.LNG_MIN} et ${SENEGAL_BOUNDS.LNG_MAX}`,
      });
      isValid = false;
    } else {
      clearErrors("longitude");
    }

    // Validation des années d'expérience
    if (data.yearsExperience < 0 || data.yearsExperience > 50) {
      setError("yearsExperience", {
        message: "L'expérience doit être entre 0 et 50 ans",
      });
      isValid = false;
    } else {
      clearErrors("yearsExperience");
    }

    // Validation des spécialisations
    if (!data.specialization || data.specialization.length === 0) {
      setError("specialization", {
        message: "Au moins une spécialisation est requise",
      });
      isValid = false;
    } else {
      clearErrors("specialization");
    }

    // Validation du téléphone (optionnel)
    if (data.phone && !/^[+]?[0-9\s-()]+$/.test(data.phone)) {
      setError("phone", { message: "Format de téléphone invalide" });
      isValid = false;
    } else {
      clearErrors("phone");
    }

    // Validation de l'email (optionnel)
    if (
      data.email &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)
    ) {
      setError("email", { message: "Format d'email invalide" });
      isValid = false;
    } else {
      clearErrors("email");
    }

    return isValid;
  };

  const onSubmit: SubmitHandler<CreateMultiplierForm> = async (data) => {
    if (!validateForm(data)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpecializationChange = (cropType: string, checked: boolean) => {
    const currentSpecialization = specialization;
    if (checked) {
      setValue("specialization", [...currentSpecialization, cropType]);
    } else {
      setValue(
        "specialization",
        currentSpecialization.filter((spec) => spec !== cropType)
      );
    }
    // Effacer l'erreur si au moins une spécialisation est sélectionnée
    if (checked || currentSpecialization.length > 1) {
      clearErrors("specialization");
    }
  };

  // Fonction pour obtenir les coordonnées approximatives d'une adresse (simulation)
  const handleAddressChange = (address: string) => {
    // Dans un vrai projet, vous utiliseriez une API de géocodage
    // Ici on simule avec des coordonnées aléatoires dans les limites du Sénégal
    if (address.toLowerCase().includes("dakar")) {
      setValue("latitude", 14.7167);
      setValue("longitude", -17.4677);
    } else if (address.toLowerCase().includes("saint-louis")) {
      setValue("latitude", 16.0469);
      setValue("longitude", -16.4626);
    } else if (address.toLowerCase().includes("thiès")) {
      setValue("latitude", 14.7886);
      setValue("longitude", -16.9352);
    }
    // Sinon garder les coordonnées par défaut
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <Users className="h-8 w-8 mr-3 text-green-600" />
            Nouveau multiplicateur
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau multiplicateur de semences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Détails d'identification du multiplicateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: Amadou Diallo" {...field} />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {MULTIPLIER_STATUSES.map((status) => (
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="tel"
                        placeholder="+221 77 123 45 67"
                        {...field}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="email"
                        placeholder="amadou@example.com"
                        {...field}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualification et expérience */}
          <Card>
            <CardHeader>
              <CardTitle>Qualification et expérience</CardTitle>
              <CardDescription>
                Niveau de certification et années d'expérience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Années d'expérience *</Label>
                <Controller
                  name="yearsExperience"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      placeholder="5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.yearsExperience && (
                  <p className="text-sm text-red-500">
                    {errors.yearsExperience.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificationLevel">
                  Niveau de certification *
                </Label>
                <Controller
                  name="certificationLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {CERTIFICATION_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center space-x-2">
                              <span>{level.label}</span>
                              <span className="text-xs text-muted-foreground">
                                ({level.experience})
                              </span>
                              <div className="flex">
                                {Array.from({
                                  length:
                                    level.experience === "0-2 ans"
                                      ? 1
                                      : level.experience === "2-5 ans"
                                      ? 2
                                      : 3,
                                }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-3 w-3 text-yellow-400 fill-current"
                                  />
                                ))}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.certificationLevel && (
                  <p className="text-sm text-red-500">
                    {errors.certificationLevel.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
              <CardDescription>
                Adresse et coordonnées géographiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Quartier, Ville, Région"
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 inline mr-1" />
                Les coordonnées peuvent être automatiquement remplies selon
                l'adresse
              </div>
            </CardContent>
          </Card>

          {/* Spécialisations */}
          <Card>
            <CardHeader>
              <CardTitle>Spécialisations</CardTitle>
              <CardDescription>
                Types de cultures maîtrisées par le multiplicateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {CROP_TYPES.map((crop) => (
                  <div key={crop.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={crop.value}
                      checked={specialization.includes(crop.value)}
                      onCheckedChange={(checked) =>
                        handleSpecializationChange(
                          crop.value,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={crop.value}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <span className="text-lg">{crop.icon}</span>
                      <span>{crop.label}</span>
                    </Label>
                  </div>
                ))}
              </div>

              {errors.specialization && (
                <p className="text-sm text-red-500">
                  {errors.specialization.message}
                </p>
              )}

              {specialization.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Spécialisations sélectionnées:
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specialization.map((spec) => {
                      const crop = CROP_TYPES.find((c) => c.value === spec);
                      return (
                        <Badge key={spec} variant="outline">
                          <span className="mr-1">{crop?.icon}</span>
                          {crop?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/multipliers")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Créer le multiplicateur
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMultiplier;
