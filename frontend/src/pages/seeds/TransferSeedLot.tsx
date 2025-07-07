// frontend/src/pages/seeds/TransferSeedLot.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
import { seedLotService } from "../../services/seedLotService";
import { api } from "../../services/api";
import type { SeedLot, Multiplier } from "../../types/entities";
import type { ApiResponse } from "../../types/api";
import { formatNumber } from "../../utils/formatters";

interface TransferForm {
  targetMultiplierId: number;
  quantity: number;
  notes?: string;
}

const TransferSeedLot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupération du lot
  const { data: seedLotData, isLoading: seedLotLoading } = useQuery<ApiResponse<SeedLot>>({
    queryKey: ["seed-lot", id],
    queryFn: async () => {
      if (!id) throw new Error("ID manquant");
      return await seedLotService.getById(id);
    },
    enabled: !!id,
  });

  const seedLot = seedLotData?.data;

  // Récupération des multiplicateurs
  const { data: multipliersResponse, isLoading: multipliersLoading } = useQuery
    ApiResponse<Multiplier[]>
  >({
    queryKey: ["multipliers-for-transfer"],
    queryFn: async () => {
      const response = await api.get("/multipliers", {
        params: { pageSize: 100, status: "active" },
      });
      return response.data;
    },
  });

  const multipliers = multipliersResponse?.data || [];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransferForm>({
    defaultValues: {
      quantity: 0,
      notes: "",
    },
  });

  const watchedQuantity = watch("quantity");

  const transferMutation = useMutation({
    mutationFn: async (data: TransferForm) => {
      if (!id) throw new Error("ID manquant");
      const response = await seedLotService.transferLot(id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lot transféré avec succès !");
      navigate(`/dashboard/seed-lots/${id}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Erreur lors du transfert du lot";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: TransferForm) => {
    setIsSubmitting(true);
    try {
      await transferMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (seedLotLoading || multipliersLoading) {
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

  const availableQuantity = seedLot.availableQuantity || seedLot.quantity;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold">Transférer le lot</h1>
          <p className="text-muted-foreground">
            Transférer le lot {seedLot.id} vers un autre multiplicateur
          </p>
        </div>
      </div>

      {/* Informations du lot */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du lot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Lot</p>
              <p className="font-medium">{seedLot.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Variété</p>
              <p className="font-medium">{seedLot.variety?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Niveau</p>
              <p className="font-medium">{seedLot.level}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantité disponible</p>
              <p className="font-medium">{formatNumber(availableQuantity)} kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de transfert */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails du transfert</CardTitle>
            <CardDescription>
              Spécifiez le destinataire et la quantité à transférer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetMultiplierId">
                Multiplicateur destinataire *
              </Label>
              <Controller
                name="targetMultiplierId"
                control={control}
                rules={{ required: "Multiplicateur requis" }}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un multiplicateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {multipliers
                        .filter(m => m.id !== seedLot.multiplier?.id)
                        .map((multiplier) => (
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
              {errors.targetMultiplierId && (
                <p className="text-sm text-red-500">
                  {errors.targetMultiplierId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité à transférer (kg) *</Label>
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: "Quantité requise",
                  min: {
                    value: 0.1,
                    message: "Quantité minimum 0.1 kg",
                  },
                  max: {
                    value: availableQuantity,
                    message: `Quantité maximum ${formatNumber(availableQuantity)} kg`,
                  },
                }}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={`Max: ${formatNumber(availableQuantity)} kg`}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                )}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
              {watchedQuantity > 0 && (
                <p className="text-sm text-muted-foreground">
                  Quantité restante après transfert:{" "}
                  {formatNumber(availableQuantity - watchedQuantity)} kg
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    placeholder="Raison du transfert, conditions particulières..."
                    className="min-h-[100px]"
                    {...field}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/seed-lots/${id}`)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !watchedQuantity || watchedQuantity > availableQuantity}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <ArrowRight className="mr-2 h-4 w-4" />
            Transférer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransferSeedLot;