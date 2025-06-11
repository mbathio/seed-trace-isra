// ===== CORRECTION 1: frontend/src/pages/seeds/CreateSeedLot.tsx =====

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Sprout } from "lucide-react";
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
import { SEED_LEVELS } from "../../constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { Variety, Multiplier, SeedLot } from "../../types/entities";
import { seedLotValidationSchema } from "../../utils/validators";

interface CreateSeedLotForm {
  varietyId: number;
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  multiplierId?: number;
  parentLotId?: string;
  notes?: string;
  batchNumber?: string;
}

const CreateSeedLot: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CreateSeedLotForm>({
    resolver: yupResolver(seedLotValidationSchema),
    defaultValues: {
      varietyId: 0,
      level: "GO",
      quantity: 0,
      productionDate: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch varieties
  const { data: varieties } = useQuery<Variety[]>({
    queryKey: ["varieties"],
    queryFn: async () => {
      const response = await api.get("/varieties");
      return response.data.data;
    },
  });

  // Fetch multipliers
  const { data: multipliers } = useQuery<Multiplier[]>({
    queryKey: ["multipliers"],
    queryFn: async () => {
      const response = await api.get("/multipliers");
      return response.data.data;
    },
  });

  // Fetch parent lots for genealogy
  const { data: parentLots } = useQuery<SeedLot[]>({
    queryKey: ["parent-lots", watch("level")],
    queryFn: async () => {
      const currentLevel = getValues("level");
      if (!currentLevel) return [];

      const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
      const currentIndex = levelHierarchy.indexOf(currentLevel);

      if (currentIndex <= 0) return [];

      const parentLevel = levelHierarchy[currentIndex - 1];
      const response = await api.get("/seed-lots", {
        params: { level: parentLevel, status: "CERTIFIED" },
      });
      return response.data.data;
    },
    enabled: !!watch("level"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateSeedLotForm) => {
      const response = await api.post("/seed-lots", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Lot de semences créé avec succès !");
      navigate(`/seeds/${data.data.id}`);
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la création du lot";
      toast.error(errorMessage);
    },
  });

  const onSubmit: SubmitHandler<CreateSeedLotForm> = async (data) => {
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
          onClick={() => navigate("/seeds")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Sprout className="h-8 w-8 mr-3 text-green-600" />
            Créer un lot de semences
          </h1>
          <p className="text-muted-foreground">
            Enregistrez un nouveau lot dans le système de traçabilité
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
                Détails essentiels du lot de semences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="varietyId">Variété *</Label>
                <Controller
                  name="varietyId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une variété" />
                      </SelectTrigger>
                      <SelectContent>
                        {varieties?.map((variety) => (
                          <SelectItem
                            key={variety.id}
                            value={variety.id.toString()}
                          >
                            {variety.name} ({variety.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.varietyId && (
                  <p className="text-sm text-red-500">
                    {errors.varietyId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Niveau *</Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEED_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.level && (
                  <p className="text-sm text-red-500">{errors.level.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité (kg) *</Label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="100"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productionDate">Date de production *</Label>
                <Controller
                  name="productionDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.productionDate && (
                  <p className="text-sm text-red-500">
                    {errors.productionDate.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations complémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
              <CardDescription>
                Détails optionnels et traçabilité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="multiplierId">Multiplicateur</Label>
                <Controller
                  name="multiplierId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(value) =>
                        field.onChange(value ? parseInt(value) : undefined)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un multiplicateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {multipliers?.map((multiplier) => (
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
              </div>

              {parentLots && parentLots.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="parentLotId">Lot parent</Label>
                  <Controller
                    name="parentLotId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un lot parent" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentLots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.id} - {lot.variety.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Numéro de lot</Label>
                <Controller
                  name="batchNumber"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: LOT-2024-001" {...field} />
                  )}
                />
                {errors.batchNumber && (
                  <p className="text-sm text-red-500">
                    {errors.batchNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Date d'expiration</Label>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-red-500">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Notes et observations</CardTitle>
              <CardDescription>
                Informations complémentaires sur le lot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Observations, conditions particulières, remarques..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  )}
                />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
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
            onClick={() => navigate("/seeds")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Créer le lot
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSeedLot;
