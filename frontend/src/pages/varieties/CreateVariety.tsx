import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import { CROP_TYPES } from "../../constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { varietyValidationSchema } from "../../utils/validators";

interface CreateVarietyForm {
  code: string;
  name: string;
  cropType: "RICE" | "MAIZE" | "PEANUT" | "SORGHUM" | "COWPEA" | "MILLET";
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances: string[];
  origin?: string;
  releaseYear?: number;
}

const CreateVariety: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newResistance, setNewResistance] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateVarietyForm>({
    resolver: yupResolver(varietyValidationSchema),
    defaultValues: {
      maturityDays: 90,
      resistances: [],
    },
  });

  const resistances = watch("resistances") || [];

  const createMutation = useMutation({
    mutationFn: async (data: CreateVarietyForm) => {
      const response = await api.post("/varieties", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Variété créée avec succès !");
      navigate(`/varieties/${data.data.code}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de la création de la variété";
      toast.error(errorMessage);
    },
  });

  const addResistance = () => {
    if (newResistance.trim() && !resistances.includes(newResistance.trim())) {
      setValue("resistances", [...resistances, newResistance.trim()]);
      setNewResistance("");
    }
  };

  const removeResistance = (index: number) => {
    setValue(
      "resistances",
      resistances.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: CreateVarietyForm) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/varieties")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Créer une variété</h1>
          <p className="text-muted-foreground">
            Ajouter une nouvelle variété au catalogue
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations principales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
              <CardDescription>
                Détails essentiels de la variété
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code variété *</Label>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="ex: SAHEL108"
                      className="uppercase"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  )}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: Sahel 108" {...field} />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropType">Type de culture *</Label>
                <Controller
                  name="cropType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cropType && (
                  <p className="text-sm text-red-500">
                    {errors.cropType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Description de la variété..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques agronomiques */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques agronomiques</CardTitle>
              <CardDescription>
                Propriétés techniques de la variété
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maturityDays">
                  Durée de maturité (jours) *
                </Label>
                <Controller
                  name="maturityDays"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="90"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.maturityDays && (
                  <p className="text-sm text-red-500">
                    {errors.maturityDays.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yieldPotential">
                  Potentiel de rendement (t/ha)
                </Label>
                <Controller
                  name="yieldPotential"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || undefined)
                      }
                    />
                  )}
                />
                {errors.yieldPotential && (
                  <p className="text-sm text-red-500">
                    {errors.yieldPotential.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origine</Label>
                <Controller
                  name="origin"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: ISRA, ICRISAT..." {...field} />
                  )}
                />
                {errors.origin && (
                  <p className="text-sm text-red-500">
                    {errors.origin.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseYear">Année de création</Label>
                <Controller
                  name="releaseYear"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="2024"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  )}
                />
                {errors.releaseYear && (
                  <p className="text-sm text-red-500">
                    {errors.releaseYear.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Résistances */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Résistances</CardTitle>
              <CardDescription>
                Maladies et stress auxquels la variété résiste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="ex: Sécheresse, Pyriculariose..."
                  value={newResistance}
                  onChange={(e) => setNewResistance(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addResistance();
                    }
                  }}
                />
                <Button type="button" onClick={addResistance}>
                  Ajouter
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {resistances.map((resistance, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {resistance}
                    <button
                      type="button"
                      onClick={() => removeResistance(index)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              {resistances.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucune résistance ajoutée
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/varieties")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Créer la variété
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateVariety;
