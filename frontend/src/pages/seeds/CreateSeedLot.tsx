// frontend/src/pages/seeds/CreateSeedLot.tsx - VERSION FINALE STABLE ET INTELLIGENTE
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
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
import type { Variety, SeedLot } from "../../types/entities";
import type { ApiResponse } from "../../types/api";
import { SEED_LEVELS } from "../../constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { seedLotValidationSchema } from "../../utils/validators";
import { seedLotService } from "../../services/seedLotService";

interface CreateSeedLotForm {
  varietyId: number;
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  notes?: string;
  batchNumber?: string;
  multiplierId?: number;
  parentLotId?: string;
}

const CreateSeedLot: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateSeedLotForm>({
    resolver: yupResolver(seedLotValidationSchema),
    defaultValues: {
      quantity: 0,
      level: "G1",
      productionDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedLevel = watch("level");
  const selectedVariety = watch("varietyId");

  // 🔹 Charger les variétés disponibles
  const { data: varietiesResponse, isLoading: varietiesLoading } = useQuery<
    ApiResponse<Variety[]>
  >({
    queryKey: ["varieties-for-seed-lot"],
    queryFn: async () => {
      const response = await api.get("/varieties", {
        params: { pageSize: 100 },
      });
      return response.data;
    },
  });

  const varieties = varietiesResponse?.data || [];

  // 🔹 Déterminer le niveau parent selon le niveau choisi
  const getParentLevel = (level: string): string | null => {
    switch (level) {
      case "G1":
        return "GO";
      case "G2":
        return "G1";
      case "G3":
        return "G2";
      case "G4":
        return "G3";
      case "R1":
        return "G4";
      case "R2":
        return "R1";
      default:
        return null;
    }
  };

  // 🔹 Charger les lots parents disponibles
  const { data: lotsResponse, isLoading: lotsLoading } = useQuery<
    ApiResponse<SeedLot[]>
  >({
    queryKey: ["parent-lots", selectedLevel, selectedVariety],
    enabled: !!selectedVariety && selectedLevel !== "GO",
    queryFn: async () => {
      const parentLevel = getParentLevel(selectedLevel);
      if (!parentLevel) return { data: [] };

      const response = await api.get("/seed-lots", {
        params: {
          level: parentLevel,
          varietyId: selectedVariety,
          status: "CERTIFIED",
          pageSize: 100,
        },
      });
      return response.data;
    },
  });

  const parentLots = lotsResponse?.data || [];

  // 🔹 Mutation pour la création du lot
  const createMutation = useMutation({
    mutationFn: async (data: CreateSeedLotForm) => {
      // Convert parentLotId to number if present
      const payload = {
        ...data,
        parentLotId: data.parentLotId ? Number(data.parentLotId) : undefined,
      };
      const response = await seedLotService.create(payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("✅ Lot de semences créé avec succès !");
      navigate(`/dashboard/seed-lots/${data.id}`);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Erreur lors de la création du lot";
      toast.error(msg);
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
      {/* En-tête */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/seed-lots")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Sprout className="h-8 w-8 mr-3 text-green-600" />
            Nouveau lot de semences
          </h1>
          <p className="text-muted-foreground">
            Créer un nouveau lot pour le suivi et la traçabilité
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* === Carte 1 : Informations de base === */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Détails essentiels du lot de semences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Variété */}
              <div className="space-y-2">
                <Label>Variété *</Label>
                <Controller
                  name="varietyId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() ?? undefined}
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      disabled={varietiesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une variété" />
                      </SelectTrigger>
                      <SelectContent>
                        {varieties.map((v) => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            {v.name} ({v.code})
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

              {/* Niveau */}
              <div className="space-y-2">
                <Label>Niveau *</Label>
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
              </div>

              {/* Quantité */}
              <div className="space-y-2">
                <Label>Quantité (kg) *</Label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input type="number" step="0.1" min="0" {...field} />
                  )}
                />
              </div>

              {/* Lot parent */}
              {selectedLevel !== "GO" && (
                <div className="space-y-2">
                  <Label>Lot parent (même variété, certifié)</Label>
                  <Controller
                    name="parentLotId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() ?? undefined}
                        onValueChange={field.onChange}
                        disabled={lotsLoading || !selectedVariety}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un lot parent" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentLots.length > 0 ? (
                            parentLots.map((lot) => (
                              <SelectItem
                                key={lot.id}
                                value={lot.id.toString()}
                              >
                                {lot.batchNumber || lot.id} — {lot.level} (
                                {lot.variety?.name})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Aucun lot parent disponible
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* === Carte 2 : Informations complémentaires === */}
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
              <CardDescription>
                Dates, notes et informations additionnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date de production */}
              <div className="space-y-2">
                <Label>Date de production *</Label>
                <Controller
                  name="productionDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
              </div>

              {/* Date d’expiration */}
              <div className="space-y-2">
                <Label>Date d’expiration</Label>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
              </div>

              {/* Numéro de lot */}
              <div className="space-y-2">
                <Label>Numéro de lot (généré automatiquement si vide)</Label>
                <Controller
                  name="batchNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Laissez vide pour génération automatique"
                      {...field}
                    />
                  )}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Observations ou remarques supplémentaires..."
                      {...field}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bouton d’enregistrement */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Enregistrer le lot
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSeedLot;
