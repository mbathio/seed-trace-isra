// frontend/src/pages/multipliers/EditMultiplier.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import { MultiplierService } from "../../services/MultiplierService";
import {
  MULTIPLIER_STATUSES,
  CERTIFICATION_LEVELS,
  CROP_TYPES,
  SENEGAL_BOUNDS,
} from "../../constants";
import { CROP_TYPE_ICONS } from "../../constants/icons";
import type { Multiplier } from "../../types/entities";

interface EditMultiplierForm {
  name: string;
  status: "active" | "inactive";
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  yearsExperience: number;
  certificationLevel: "beginner" | "intermediate" | "expert";
  specialization: string[];
}

const EditMultiplier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Récupération du multiplicateur à éditer
  const {
    data: multiplier,
    isLoading,
    error,
  } = useQuery<Multiplier>({
    queryKey: ["multiplier", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) {
        throw new Error("ID du multiplicateur manquant");
      }
      return await MultiplierService.getById(id);
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<EditMultiplierForm>({
    defaultValues: {
      name: "",
      status: "active",
      address: "",
      latitude: SENEGAL_BOUNDS.CENTER.lat,
      longitude: SENEGAL_BOUNDS.CENTER.lng,
      phone: "",
      email: "",
      yearsExperience: 0,
      certificationLevel: "beginner",
      specialization: [],
    },
  });

  const specialization = watch("specialization") || [];

  // 🧭 Géolocalisation automatique simulée (comme dans la création)
  const handleAddressChange = (address: string) => {
    const lower = address.toLowerCase();
    if (lower.includes("dakar")) {
      setValue("latitude", 14.7167);
      setValue("longitude", -17.4677);
    } else if (lower.includes("saint-louis")) {
      setValue("latitude", 16.0469);
      setValue("longitude", -16.4626);
    } else if (lower.includes("thiès") || lower.includes("thies")) {
      setValue("latitude", 14.7886);
      setValue("longitude", -16.9352);
    } else if (lower.includes("kaolack")) {
      setValue("latitude", 14.1465);
      setValue("longitude", -16.0726);
    } else if (lower.includes("ziguinchor")) {
      setValue("latitude", 12.5833);
      setValue("longitude", -16.2667);
    } else {
      setValue("latitude", SENEGAL_BOUNDS.CENTER.lat);
      setValue("longitude", SENEGAL_BOUNDS.CENTER.lng);
    }
  };

  // 🔍 Validation stricte (comme dans CreateMultiplier)
  const validateForm = (data: EditMultiplierForm): boolean => {
    let valid = true;

    if (!data.name || data.name.trim().length < 2) {
      setError("name", { message: "Le nom est requis" });
      valid = false;
    }

    if (!data.status) {
      setError("status", { message: "Le statut est requis" });
      valid = false;
    }

    if (!data.address || data.address.trim().length < 5) {
      setError("address", { message: "Adresse invalide" });
      valid = false;
    }

    if (data.yearsExperience < 0 || data.yearsExperience > 60) {
      setError("yearsExperience", {
        message: "Expérience invalide (0-60 ans)",
      });
      valid = false;
    }

    if (!data.specialization.length) {
      setError("specialization", {
        message: "Sélectionnez au moins une spécialisation",
      });
      valid = false;
    }

    return valid;
  };

  // 🌀 Quand les données du multiplicateur sont chargées, on remplit le formulaire
  useEffect(() => {
    if (multiplier) {
      const normalizedStatus = (multiplier.status || "active")
        .toString()
        .toLowerCase() as "active" | "inactive";

      const normalizedCert = (multiplier.certificationLevel || "beginner")
        .toString()
        .toLowerCase() as "beginner" | "intermediate" | "expert";

      const normalizedSpecs = Array.from(
        new Set(
          (multiplier.specialization || []).map((s) =>
            typeof s === "string" ? s.toLowerCase() : s
          )
        )
      );

      reset({
        name: multiplier.name,
        status: normalizedStatus,
        address: multiplier.address,
        latitude: multiplier.latitude,
        longitude: multiplier.longitude,
        phone: multiplier.phone || "",
        email: multiplier.email || "",
        yearsExperience: multiplier.yearsExperience,
        certificationLevel: normalizedCert,
        specialization: normalizedSpecs,
      });
    }
  }, [multiplier, reset]);

  // 🚀 Mutation de mise à jour
  const updateMutation = useMutation({
    mutationFn: async (data: EditMultiplierForm) => {
      if (!id) throw new Error("ID du multiplicateur manquant");

      const normalizedStatus = (data.status || "active")
        .toString()
        .toLowerCase() as "active" | "inactive";

      const normalizedSpecs = Array.from(
        new Set(data.specialization.map((s) => s.toLowerCase()))
      );

      const payload: Partial<Multiplier> = {
        name: data.name.trim(),
        status: normalizedStatus,
        address: data.address.trim(),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        phone: data.phone?.trim() || undefined,
        email: data.email?.trim() || undefined,
        yearsExperience: Number(data.yearsExperience),
        certificationLevel: data.certificationLevel,
        specialization: normalizedSpecs,
      };

      return await MultiplierService.update(id, payload);
    },
    onSuccess: (updated) => {
      toast.success("Station mise à jour avec succès !");
      navigate(`/dashboard/multipliers/${updated.id}`);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Erreur lors de la mise à jour de la station.";
      toast.error(msg);
    },
  });

  const onSubmit: SubmitHandler<EditMultiplierForm> = async (data) => {
    if (!validateForm(data)) return;
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpecializationChange = (cropType: string, checked: boolean) => {
    const current = specialization;
    if (checked) {
      setValue("specialization", [...current, cropType]);
    } else {
      setValue(
        "specialization",
        current.filter((s: string) => s !== cropType)
      );
    }
    if (checked || current.length > 1) clearErrors("specialization");
  };

  // ⏳ États de chargement / erreur
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la station...</p>
        </div>
      </div>
    );
  }

  if (error || !multiplier) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Erreur lors du chargement de la station à modifier.
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
      {/* HEADER */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/multipliers")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3 text-green-600" />
            Modifier la station
          </h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations de la station de production.
          </p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
              <CardDescription>Détails du multiplicateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nom */}
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Nom du multiplicateur" {...field} />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label>Statut *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {MULTIPLIER_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
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

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
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
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Expérience & certification */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Années d'expérience *</Label>
                  <Controller
                    name="yearsExperience"
                    control={control}
                    render={({ field }) => (
                      <Input type="number" min={0} max={60} {...field} />
                    )}
                  />
                  {errors.yearsExperience && (
                    <p className="text-sm text-red-500">
                      {errors.yearsExperience.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Niveau de certification *</Label>
                  <Controller
                    name="certificationLevel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {CERTIFICATION_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localisation & coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
              <CardDescription>
                Adresse et coordonnées géographiques de la station
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adresse */}
              <div className="space-y-2">
                <Label>Adresse *</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Ex: Saint-Louis, CRA, Sénégal"
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

              {/* Coordonnées */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude *</Label>
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <Input type="number" step="any" {...field} />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude *</Label>
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <Input type="number" step="any" {...field} />
                    )}
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 inline mr-1" />
                Les coordonnées peuvent être ajustées automatiquement selon
                l’adresse.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spécialisations */}
        <Card>
          <CardHeader>
            <CardTitle>Spécialisations</CardTitle>
            <CardDescription>Types de cultures maîtrisées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CROP_TYPES.map((crop) => (
              <div key={crop.value} className="flex items-center space-x-3">
                <Checkbox
                  id={crop.value}
                  checked={specialization.includes(crop.value)}
                  onCheckedChange={(checked) =>
                    handleSpecializationChange(crop.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={crop.value}
                  className="cursor-pointer flex items-center space-x-2"
                >
                  <span className="text-lg">{CROP_TYPE_ICONS[crop.value]}</span>
                  <span>{crop.label}</span>
                </Label>
              </div>
            ))}

            {errors.specialization && (
              <p className="text-sm text-red-500">
                {errors.specialization.message}
              </p>
            )}

            {specialization.length > 0 && (
              <div className="mt-3">
                <Label className="text-sm text-muted-foreground">
                  Spécialisations sélectionnées :
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialization.map((spec) => {
                    const crop = CROP_TYPES.find((c) => c.value === spec);
                    return (
                      <Badge key={spec} variant="outline">
                        {CROP_TYPE_ICONS[spec]} {crop?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/multipliers")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMultiplier;
