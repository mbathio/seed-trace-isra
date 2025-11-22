// frontend/src/pages/seeds/CreateSeedLot.tsx — VERSION CORRIGÉE ET STABLE ✅

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
  parcelId?: number;
  parentLotId?: string; // ✅ string attendu par le backend
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
      varietyId: 0,
      level: "G1",
      quantity: 1,
      productionDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      notes: "",
      batchNumber: "",
      multiplierId: undefined,
      parcelId: undefined,
      parentLotId: "",
    },
  });

  const selectedLevel = watch("level");
  const selectedVariety = watch("varietyId");

  // 🔹 Charger les variétés disponibles
  const { data: varietiesResponse, isLoading: loadingVarieties } = useQuery<
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
  const getParentLevel = (
    level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2"
  ): string | null => {
    const map: Record<string, string | null> = {
      G1: "GO",
      G2: "G1",
      G3: "G2",
      G4: "G3",
      R1: "G4",
      R2: "R1",
      GO: null,
    };
    return map[level] ?? null;
  };

  // 🔹 Charger les lots parents disponibles
  const { data: lotsResponse, isLoading: loadingLots } = useQuery<
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

  // 🔹 Charger les multiplicateurs (stations)
  const { data: multipliersResponse, isLoading: loadingMultipliers } = useQuery<
    ApiResponse<any[]>
  >({
    queryKey: ["multipliers-for-seed-lot"],
    queryFn: async () => {
      const response = await api.get("/multipliers", {
        params: { status: "active", pageSize: 100 },
      });
      return response.data;
    },
  });

  const multipliers = multipliersResponse?.data || [];

  // 🔹 Charger les parcelles
  const { data: parcelsResponse, isLoading: loadingParcels } = useQuery<
    ApiResponse<any[]>
  >({
    queryKey: ["parcels-for-seed-lot"],
    queryFn: async () => {
      const response = await api.get("/parcels", {
        params: {
          pageSize: 100, // nombre max
          includeRelations: true, // même logique que la liste des parcelles
        },
      });
      return response.data;
    },
  });

  const parcels = parcelsResponse?.data || [];

  // 🔹 Mutation de création du lot
  const createMutation = useMutation({
    mutationFn: async (data: CreateSeedLotForm) => {
      const payload = {
        varietyId: Number(data.varietyId),
        level: data.level.toUpperCase(),
        quantity: Number(data.quantity),
        productionDate: new Date(data.productionDate).toISOString(),
        expiryDate: data.expiryDate
          ? new Date(data.expiryDate).toISOString()
          : undefined,
        status: "PENDING", // ✅ Statut par défaut reconnue par le backend
        notes: data.notes?.trim() || undefined,
        batchNumber: data.batchNumber?.trim() || undefined,
        multiplierId: data.multiplierId ? Number(data.multiplierId) : undefined,
        parcelId: data.parcelId ? Number(data.parcelId) : undefined,
        parentLotId:
          data.parentLotId && data.parentLotId !== ""
            ? String(data.parentLotId)
            : undefined,
      };

      console.log("🚀 [CreateSeedLot] Payload envoyé :", payload);

      const response = await seedLotService.create(payload);
      return response.data;
    },
    onSuccess: (createdLot) => {
      toast.success("Lot créé avec succès");
      if (createdLot?.id) {
        navigate(`/dashboard/seed-lots/${createdLot.id}`);
      } else {
        navigate("/dashboard/seed-lots");
      }
    },
    onError: (error: any) => {
      console.error("❌ Erreur lors de la création du lot :", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la création du lot";

      toast.error(message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit: SubmitHandler<CreateSeedLotForm> = (data) => {
    if (!data.varietyId || data.varietyId === 0) {
      toast.error("Veuillez sélectionner une variété");
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const getLevelLabel = (level: string): string => {
    const found = SEED_LEVELS.find((l) => l.value === level);
    return found ? found.label : level;
  };

  const renderLevelDescription = () => {
    if (!selectedLevel) return null;
    const selected = SEED_LEVELS.find((l) => l.value === selectedLevel);
    if (!selected) return null;

    const anySelected = selected as any; // 👈 cast pour TS
    if (!anySelected.description) return null;

    return (
      <p className="text-sm text-muted-foreground mt-1">
        {anySelected.description}
      </p>
    );
  };

  const renderParentLotField = () => {
    if (selectedLevel === "GO") {
      return (
        <p className="text-sm text-muted-foreground">
          Le niveau G0 est le premier niveau de semences. Il n’a pas de lot
          parent.
        </p>
      );
    }

    if (!selectedVariety) {
      return (
        <p className="text-sm text-muted-foreground">
          Sélectionnez d’abord une variété pour voir les lots parents
          disponibles.
        </p>
      );
    }

    if (loadingLots) {
      return <p className="text-sm text-muted-foreground">Chargement…</p>;
    }

    if (!parentLots.length) {
      return (
        <p className="text-sm text-muted-foreground">
          Aucun lot parent disponible pour ce niveau et cette variété.
        </p>
      );
    }

    const parentLevel = getParentLevel(selectedLevel);

    return (
      <div className="space-y-2">
        <Label>
          Lot parent ({parentLevel}){" "}
          <span className="text-xs text-muted-foreground">
            (optionnel mais recommandé)
          </span>
        </Label>
        <Controller
          name="parentLotId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ""}
              onValueChange={(val) => field.onChange(val || "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un lot parent" />
              </SelectTrigger>
              <SelectContent>
                {parentLots.map((lot) => (
                  <SelectItem key={lot.id} value={String(lot.id)}>
                    {lot.batchNumber
                      ? `${lot.batchNumber} — ${lot.level} — ${lot.quantity} kg`
                      : `Lot ${lot.id} — ${lot.level} — ${lot.quantity} kg`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Sprout className="h-6 w-6 text-green-600" />
              Créer un nouveau lot de semences
            </h1>
            <p className="text-sm text-muted-foreground">
              Renseignez les informations nécessaires pour créer un lot.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* === Carte 1 : Informations principales === */}
          <Card>
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
              <CardDescription>
                Variété, niveau de semence, quantité et lot parent.
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
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) =>
                        field.onChange(Number(value) || 0)
                      }
                      disabled={loadingVarieties}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une variété" />
                      </SelectTrigger>
                      <SelectContent>
                        {varieties.map((variety) => (
                          <SelectItem
                            key={variety.id}
                            value={String(variety.id)}
                          >
                            {variety.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.varietyId && (
                  <p className="text-sm text-destructive">
                    {errors.varietyId.message}
                  </p>
                )}
              </div>

              {/* Niveau de semence */}
              <div className="space-y-2">
                <Label>Niveau de semence *</Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as CreateSeedLotForm["level"])
                      }
                    >
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
                {renderLevelDescription()}
              </div>

              {/* Quantité */}
              <div className="space-y-2">
                <Label>Quantité (kg) *</Label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      {...field}
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Lot parent (dépend du niveau + variété) */}
              {renderParentLotField()}
            </CardContent>
          </Card>

          {/* === Carte 2 : Informations complémentaires === */}
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
              <CardDescription>
                Dates, notes et informations additionnelles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de production *</Label>
                  <Controller
                    name="productionDate"
                    control={control}
                    render={({ field }) => <Input type="date" {...field} />}
                  />
                </div>
                <div>
                  <Label>Date d’expiration</Label>
                  <Controller
                    name="expiryDate"
                    control={control}
                    render={({ field }) => <Input type="date" {...field} />}
                  />
                </div>
              </div>

              {/* Station (multiplicateur) + Parcelle */}
              <div className="grid grid-cols-2 gap-4">
                {/* Station / multiplicateur */}
                <div className="space-y-2">
                  <Label>Station / multiplicateur</Label>
                  <Controller
                    name="multiplierId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? field.value.toString() : ""}
                        onValueChange={(v) => field.onChange(parseInt(v))}
                        disabled={loadingMultipliers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une station" />
                        </SelectTrigger>
                        <SelectContent>
                          {multipliers.map((m: any) => (
                            <SelectItem key={m.id} value={m.id.toString()}>
                              {m.name ?? `Multiplicateur #${m.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Parcelle */}
                <div className="space-y-2">
                  <Label>Parcelle</Label>
                  <Controller
                    name="parcelId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? field.value.toString() : ""}
                        onValueChange={(v) =>
                          field.onChange(v ? parseInt(v) : undefined)
                        }
                        disabled={loadingParcels}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une parcelle" />
                        </SelectTrigger>
                        <SelectContent>
                          {parcels.map((p: any) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name ?? p.code ?? `Parcelle #${p.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Numéro de lot */}
              <div className="space-y-2">
                <Label>Numéro de lot (auto si vide)</Label>
                <Controller
                  name="batchNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Laisser vide pour générer automatiquement"
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
                      rows={4}
                      placeholder="Informations complémentaires, remarques..."
                      {...field}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Boutons d’action */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
          >
            {isSubmitting || createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
