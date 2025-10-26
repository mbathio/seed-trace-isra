// frontend/src/pages/multipliers/CreateMultiplier.tsx
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

interface CreateMultiplierForm
  extends Omit<Multiplier, "id" | "createdAt" | "updatedAt"> {}

const CreateMultiplier: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateMultiplierForm>({
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

  // 🧭 Géolocalisation automatique simulée
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

  // 🔍 Validation stricte (évite les 422)
  const validateForm = (data: CreateMultiplierForm): boolean => {
    let valid = true;
    if (!data.name || data.name.trim().length < 2) {
      setError("name", { message: "Le nom est requis" });
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

  // 🚀 Envoi vers l’API
  const mutation = useMutation({
    mutationFn: async (data: CreateMultiplierForm) =>
      await MultiplierService.createMultiplier(data),
    onSuccess: (data) => {
      toast.success("Multiplicateur créé avec succès !");
      navigate(`/dashboard/multipliers/${data.id}`);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Erreur lors de la création du multiplicateur.";
      toast.error(msg);
    },
  });

  const onSubmit: SubmitHandler<CreateMultiplierForm> = async (data) => {
    if (!validateForm(data)) return;
    setIsSubmitting(true);

    // 🔧 Correction des enums avant envoi (plus de conversion en uppercase)
    const payload = {
      ...data,
    };

    try {
      await mutation.mutateAsync(payload);
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
        current.filter((s) => s !== cropType)
      );
    }
    if (checked || current.length > 1) clearErrors("specialization");
  };

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
            Nouveau multiplicateur
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau multiplicateur de semences
          </p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
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
            </CardContent>
          </Card>

          {/* Qualification */}
          <Card>
            <CardHeader>
              <CardTitle>Qualification et expérience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Années d’expérience *</Label>
                <Controller
                  name="yearsExperience"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="Ex: 10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Certification *</Label>
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
                              <div className="flex">
                                {Array.from({
                                  length:
                                    level.value === "beginner"
                                      ? 1
                                      : level.value === "intermediate"
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
                <Label>Adresse *</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Quartier, Ville, Région"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleAddressChange(e.target.value); // maj auto latitude/longitude
                      }}
                      onBlur={(e) => handleAddressChange(e.target.value)}
                    />
                  )}
                />
              </div>

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
                Les coordonnées sont automatiquement ajustées selon l’adresse.
              </div>
            </CardContent>
          </Card>

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
                    <span className="text-lg">
                      {CROP_TYPE_ICONS[crop.value]}
                    </span>
                    <span>{crop.label}</span>
                  </Label>
                </div>
              ))}

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
        </div>

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
            <Save className="mr-2 h-4 w-4" /> Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMultiplier;
