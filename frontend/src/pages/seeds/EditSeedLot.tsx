// frontend/src/pages/seeds/EditSeedLot.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
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
import { Alert, AlertDescription } from "../../components/ui/alert";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import { seedLotService } from "../../services/seedLotService";
import type { Variety, Multiplier, SeedLot } from "../../types/entities";
import type { ApiResponse } from "../../types/api";
import { SEED_LEVELS, LOT_STATUSES } from "../../constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { seedLotValidationSchema } from "../../utils/validators";

interface EditSeedLotForm {
  varietyId: number;
  level: string;
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status?: string;
  notes?: string;
  batchNumber?: string;
  multiplierId?: number;
  parentLotId?: string;
}

const EditSeedLot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: seedLotData, isLoading: seedLotLoading } = useQuery<
    ApiResponse<SeedLot>
  >({
    queryKey: ["seed-lot", id],
    queryFn: async () => {
      if (!id) throw new Error("ID manquant");
      return await seedLotService.getById(id);
    },
    enabled: !!id,
  });

  const seedLot = seedLotData?.data;

  const { data: varietiesData, isLoading: varietiesLoading } = useQuery<
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

  const varieties = varietiesData?.data || [];

  const { data: multipliersData, isLoading: multipliersLoading } = useQuery<
    ApiResponse<Multiplier[]>
  >({
    queryKey: ["multipliers-for-seed-lot"],
    queryFn: async () => {
      const response = await api.get("/multipliers", {
        params: { pageSize: 100, status: "active" },
      });
      return response.data;
    },
  });

  const multipliers = multipliersData?.data || [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditSeedLotForm>({
    resolver: yupResolver(seedLotValidationSchema),
  });

  useEffect(() => {
    if (seedLot) {
      const safeDate = (value?: string) =>
        value && value.includes("T") ? value.split("T")[0] : "";

      reset({
        varietyId: seedLot.varietyId,
        level: seedLot.level,
        quantity: seedLot.quantity,
        productionDate: safeDate(seedLot.productionDate),
        expiryDate: safeDate(seedLot.expiryDate),
        status: seedLot.status,
        notes: seedLot.notes || "",
        batchNumber: seedLot.batchNumber || "",
        multiplierId: seedLot.multiplier?.id,
        parentLotId: seedLot.parentLotId || "",
      });
    }
  }, [seedLot, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<EditSeedLotForm>) => {
      if (!id) throw new Error("ID manquant");
      const response = await seedLotService.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lot de semences mis à jour avec succès !");
      navigate(`/dashboard/seed-lots/${id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la mise à jour du lot";
      console.error("Erreur backend:", error?.response?.data);
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: EditSeedLotForm) => {
    const payload = {
      quantity: data.quantity,
      status: data.status,
      notes: data.notes,
      expiryDate: data.expiryDate,
      batchNumber: data.batchNumber,
      multiplierId: data.multiplierId,
    };

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (seedLotLoading || varietiesLoading || multipliersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!seedLot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertDescription>Lot de semences non trouvé</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/seed-lots/${id}`)}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Sprout className="h-8 w-8 mr-3 text-green-600" />
            Modifier le lot {seedLot.id}
          </h1>
          <p className="text-muted-foreground">
            Mettre à jour les informations du lot de semences
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
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une variété" />
                      </SelectTrigger>
                      <SelectContent>
                        {varieties.map((variety) => (
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
                <Label htmlFor="status">Statut</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOT_STATUSES.map((status) => (
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
                <Label htmlFor="batchNumber">Numéro de lot</Label>
                <Controller
                  name="batchNumber"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: 2024-001" {...field} />
                  )}
                />
                {errors.batchNumber && (
                  <p className="text-sm text-red-500">
                    {errors.batchNumber.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations de production */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de production</CardTitle>
              <CardDescription>Dates et détails de production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="multiplierId">Multiplicateur</Label>
                <Controller
                  name="multiplierId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || "__none"}
                      onValueChange={(value) =>
                        field.onChange(
                          value === "__none" ? undefined : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un multiplicateur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Aucun</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="parentLotId">Lot parent (optionnel)</Label>
                <Controller
                  name="parentLotId"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ID du lot parent" {...field} disabled />
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  Le lot parent ne peut pas être modifié
                </p>
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
                      placeholder="Notes sur le lot, conditions de stockage, observations..."
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
            onClick={() => navigate(`/dashboard/seed-lots/${id}`)}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSeedLot;
