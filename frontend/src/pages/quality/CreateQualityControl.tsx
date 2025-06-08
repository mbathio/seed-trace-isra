import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, FlaskConical } from "lucide-react";
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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface CreateQualityControlForm {
  lotId: string;
  controlDate: string;
  germinationRate: number;
  varietyPurity: number;
  moistureContent?: number;
  seedHealth?: number;
  observations?: string;
  testMethod?: string;
}

// Schéma de validation adapté à l'interface
const qualityControlValidationSchema = yup.object({
  lotId: yup.string().required("Lot requis"),
  controlDate: yup
    .string()
    .required("Date de contrôle requise")
    .test(
      "is-not-future",
      "La date ne peut pas être dans le futur",
      function (value) {
        if (!value) return true;
        return new Date(value) <= new Date();
      }
    ),
  germinationRate: yup
    .number()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%")
    .required("Taux de germination requis"),
  varietyPurity: yup
    .number()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%")
    .required("Pureté variétale requise"),
  moistureContent: yup
    .number()
    .optional()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%"),
  seedHealth: yup
    .number()
    .optional()
    .min(0, "Minimum 0%")
    .max(100, "Maximum 100%"),
  observations: yup
    .string()
    .optional()
    .max(1000, "Observations trop longues (max 1000 caractères)"),
  testMethod: yup.string().optional(),
});

const CreateQualityControl: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateQualityControlForm>({
    resolver: yupResolver(qualityControlValidationSchema),
    defaultValues: {
      controlDate: new Date().toISOString().split("T")[0],
      germinationRate: 0,
      varietyPurity: 0,
    },
  });

  // Fetch seed lots for selection
  const { data: seedLots } = useQuery<SeedLot[]>({
    queryKey: ["seed-lots-for-control"],
    queryFn: async () => {
      const response = await api.get("/seeds", {
        params: { status: "pending", pageSize: 100 },
      });
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateQualityControlForm) => {
      const response = await api.post("/quality-controls", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contrôle qualité créé avec succès !");
      navigate("/quality");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de la création du contrôle";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: CreateQualityControlForm) => {
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
          onClick={() => navigate("/quality")}
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
            Effectuer un test de qualité sur un lot de semences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>Lot à contrôler et date du test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        {seedLots?.map((lot) => (
                          <SelectItem key={lot.id} value={lot.id}>
                            {lot.id} - {lot.variety.name} ({lot.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.lotId && (
                  <p className="text-sm text-red-500">{errors.lotId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="controlDate">Date du contrôle *</Label>
                <Controller
                  name="controlDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
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
                        <SelectItem value="ISTA">ISTA Standard</SelectItem>
                        <SelectItem value="AOSA">AOSA Standard</SelectItem>
                        <SelectItem value="ISRA">Protocole ISRA</SelectItem>
                        <SelectItem value="OTHER">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Résultats des tests */}
          <Card>
            <CardHeader>
              <CardTitle>Résultats des tests</CardTitle>
              <CardDescription>Mesures et pourcentages obtenus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="95.5"
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
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="99.0"
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
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="12.5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  )}
                />
                {errors.moistureContent && (
                  <p className="text-sm text-red-500">
                    {errors.moistureContent.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="seedHealth">État sanitaire (%)</Label>
                <Controller
                  name="seedHealth"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="98.0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  )}
                />
                {errors.seedHealth && (
                  <p className="text-sm text-red-500">
                    {errors.seedHealth.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Observations</CardTitle>
              <CardDescription>
                Notes et remarques sur le contrôle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observations">Notes et observations</Label>
                <Controller
                  name="observations"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Observations sur l'état des semences, conditions du test, anomalies détectées..."
                      className="min-h-[100px]"
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
            onClick={() => navigate("/quality")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Enregistrer le contrôle
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateQualityControl;
