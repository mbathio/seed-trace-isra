// frontend/src/pages/productions/CreateProduction.tsx - VERSION CORRIGÉE

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Save, Loader2, Tractor } from "lucide-react";
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
import { SeedLot, Multiplier, Parcel } from "../../types/entities";
import { ApiResponse } from "../../types/api";
import { PRODUCTION_STATUSES } from "../../constants";
import { productionValidationSchema } from "../../utils/validators";

interface CreateProductionForm {
  lotId: string;
  multiplierId: number;
  parcelId: number;
  startDate: string;
  endDate?: string;
  sowingDate: string;
  harvestDate?: string;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  plannedQuantity?: number;
  actualYield?: number;
  notes?: string;
  weatherConditions?: string;
}

const CreateProduction: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateProductionForm>({
    resolver: yupResolver(productionValidationSchema),
    defaultValues: {
      status: "planned",
      startDate: new Date().toISOString().split("T")[0],
      sowingDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedMultiplierId = watch("multiplierId");

  // Récupération des lots de semences disponibles
  const { data: seedLotsResponse } = useQuery<ApiResponse<SeedLot[]>>({
    queryKey: ["seed-lots-for-production"],
    queryFn: async () => {
      const response = await api.get("/seed-lots", {
        params: { status: "certified", pageSize: 100 },
      });
      return response.data;
    },
  });

  // Récupération des multiplicateurs actifs
  const { data: multipliersResponse } = useQuery<ApiResponse<Multiplier[]>>({
    queryKey: ["multipliers-for-production"],
    queryFn: async () => {
      const response = await api.get("/multipliers", {
        params: { status: "active", pageSize: 100 },
      });
      return response.data;
    },
  });

  // Récupération des parcelles disponibles pour le multiplicateur sélectionné
  const { data: parcelsResponse } = useQuery<ApiResponse<Parcel[]>>({
    queryKey: ["parcels-for-production", selectedMultiplierId],
    queryFn: async () => {
      const params: any = { status: "available", pageSize: 100 };
      if (selectedMultiplierId) {
        params.multiplierId = selectedMultiplierId;
      }
      const response = await api.get("/parcels", { params });
      return response.data;
    },
    enabled: !!selectedMultiplierId,
  });

  const seedLots = seedLotsResponse?.data || [];
  const multipliers = multipliersResponse?.data || [];
  const parcels = parcelsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: CreateProductionForm) => {
      // Envoyer les données directement (pas de transformation nécessaire)
      const response = await api.post("/productions", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Production créée avec succès !");
      navigate(`/dashboard/productions/${data.data.id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de la création de la production";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: CreateProductionForm) => {
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
          onClick={() => navigate("/dashboard/productions")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Tractor className="h-8 w-8 mr-3 text-green-600" />
            Nouvelle production
          </h1>
          <p className="text-muted-foreground">
            Lancer un nouveau cycle de production de semences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sélection du lot et du responsable */}
          <Card>
            <CardHeader>
              <CardTitle>Lot et responsable</CardTitle>
              <CardDescription>
                Sélection du lot de semences et du multiplicateur responsable
              </CardDescription>
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
                        <SelectValue placeholder="Sélectionner un lot certifié" />
                      </SelectTrigger>
                      <SelectContent>
                        {seedLots.map((lot) => (
                          <SelectItem key={lot.id} value={lot.id}>
                            {lot.id} - {lot.variety?.name || "Variété"} (
                            {lot.level}) - {lot.quantity}kg
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
                <Label htmlFor="multiplierId">
                  Multiplicateur responsable *
                </Label>
                <Controller
                  name="multiplierId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un multiplicateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {multipliers.map((multiplier) => (
                          <SelectItem
                            key={multiplier.id}
                            value={multiplier.id.toString()}
                          >
                            {multiplier.name} - {multiplier.address}
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

              <div className="space-y-2">
                <Label htmlFor="parcelId">Parcelle *</Label>
                <Controller
                  name="parcelId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={!selectedMultiplierId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedMultiplierId
                              ? "Sélectionner une parcelle"
                              : "Sélectionnez d'abord un multiplicateur"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {parcels.map((parcel) => (
                          <SelectItem
                            key={parcel.id}
                            value={parcel.id.toString()}
                          >
                            {parcel.name || `Parcelle ${parcel.id}`} -{" "}
                            {parcel.area} ha
                            {parcel.soilType && ` - ${parcel.soilType}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.parcelId && (
                  <p className="text-sm text-red-500">
                    {errors.parcelId.message}
                  </p>
                )}
                {!selectedMultiplierId && (
                  <p className="text-xs text-muted-foreground">
                    Sélectionnez un multiplicateur pour voir ses parcelles
                    disponibles
                  </p>
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
                        {PRODUCTION_STATUSES.map((status) => (
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
            </CardContent>
          </Card>

          {/* Planification temporelle */}
          <Card>
            <CardHeader>
              <CardTitle>Planification temporelle</CardTitle>
              <CardDescription>
                Dates importantes du cycle de production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sowingDate">Date de semis *</Label>
                <Controller
                  name="sowingDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.sowingDate && (
                  <p className="text-sm text-red-500">
                    {errors.sowingDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin prévue</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">Date de récolte prévue</Label>
                <Controller
                  name="harvestDate"
                  control={control}
                  render={({ field }) => <Input type="date" {...field} />}
                />
                {errors.harvestDate && (
                  <p className="text-sm text-red-500">
                    {errors.harvestDate.message}
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Conseil</h4>
                <p className="text-sm text-blue-700">
                  Les dates de fin et de récolte peuvent être ajustées plus tard
                  selon l'évolution de la production.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Objectifs et conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Objectifs et conditions</CardTitle>
              <CardDescription>
                Quantités planifiées et conditions de production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plannedQuantity">Quantité planifiée (kg)</Label>
                <Controller
                  name="plannedQuantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="1000"
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
                {errors.plannedQuantity && (
                  <p className="text-sm text-red-500">
                    {errors.plannedQuantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualYield">Rendement attendu (t/ha)</Label>
                <Controller
                  name="actualYield"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="2.5"
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
                {errors.actualYield && (
                  <p className="text-sm text-red-500">
                    {errors.actualYield.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Ce champ sera mis à jour avec le rendement réel à la récolte
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weatherConditions">Conditions météo</Label>
                <Controller
                  name="weatherConditions"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Conditions météorologiques attendues ou observées..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  )}
                />
                {errors.weatherConditions && (
                  <p className="text-sm text-red-500">
                    {errors.weatherConditions.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes et observations</CardTitle>
              <CardDescription>
                Informations complémentaires sur cette production
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
                      placeholder="Objectifs spécifiques, contraintes, remarques..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  )}
                />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Prochaines étapes
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Planifier les activités de production</li>
                  <li>• Suivre l'évolution et enregistrer les activités</li>
                  <li>• Signaler les problèmes éventuels</li>
                  <li>• Mettre à jour les dates et rendements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/productions")}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Créer la production
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduction;
