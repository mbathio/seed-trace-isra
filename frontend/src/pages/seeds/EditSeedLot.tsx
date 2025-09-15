// frontend/src/pages/seeds/EditSeedLot.tsx - VERSION CORRIGÉE FINALE
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
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
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
      const safeDate = (value?: string) => {
        if (!value) return "";
        // Si c'est déjà une date ISO, on prend juste la partie date
        if (value.includes("T")) {
          return value.split("T")[0];
        }
        // Sinon, on convertit la date en format YYYY-MM-DD
        const date = new Date(value);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
      };

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

      // ✅ CORRECTION : Préparer les données en s'assurant qu'elles sont conformes
      const updateData: any = {};

      // Ajouter seulement les champs modifiables
      if (data.quantity !== undefined) {
        updateData.quantity = Number(data.quantity);
      }

      if (data.status !== undefined && data.status !== "") {
        updateData.status = data.status;
      }

      if (data.notes !== undefined) {
        updateData.notes = data.notes || null;
      }

      if (data.expiryDate !== undefined) {
        updateData.expiryDate = data.expiryDate || null;
      }

      if (data.batchNumber !== undefined) {
        updateData.batchNumber = data.batchNumber || null;
      }

      // ✅ CORRECTION : Gérer le multiplicateur correctement
      if (data.multiplierId !== undefined) {
        updateData.multiplierId = data.multiplierId || null;
      }

      console.log("📤 Données envoyées au backend:", updateData);

      const response = await seedLotService.update(id, updateData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lot de semences mis à jour avec succès !");
      navigate(`/dashboard/seed-lots/${id}`);
    },
    onError: (error: any) => {
      console.error("❌ Erreur complète:", error);
      console.error("📋 Réponse du serveur:", error?.response?.data);

      let errorMessage = "Erreur lors de la mise à jour du lot";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Afficher les détails de validation si disponibles
      if (error?.response?.data?.details) {
        console.error("🔍 Détails de validation:", error.response.data.details);
        errorMessage += ` - ${JSON.stringify(error.response.data.details)}`;
      }

      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: EditSeedLotForm) => {
    console.log("📝 Données du formulaire:", data);

    // ✅ CORRECTION : Préparer seulement les champs modifiables
    const updatePayload = {
      quantity: data.quantity,
      status: data.status,
      notes: data.notes,
      expiryDate: data.expiryDate,
      batchNumber: data.batchNumber,
      multiplierId: data.multiplierId,
    };

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(updatePayload);
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
              {/* ✅ CORRECTION : Champs en lecture seule */}
              <div className="space-y-2">
                <Label>ID du lot</Label>
                <Input value={seedLot.id} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">
                  L'ID du lot ne peut pas être modifié
                </p>
              </div>

              <div className="space-y-2">
                <Label>Variété</Label>
                <Input
                  value={`${seedLot.variety?.name} (${seedLot.variety?.code})`}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  La variété ne peut pas être modifiée
                </p>
              </div>

              <div className="space-y-2">
                <Label>Niveau</Label>
                <Input value={seedLot.level} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">
                  Le niveau ne peut pas être modifié
                </p>
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
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
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
                <Label>Date de production</Label>
                <Input
                  value={new Date(seedLot.productionDate).toLocaleDateString(
                    "fr-FR"
                  )}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  La date de production ne peut pas être modifiée
                </p>
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

              {/* ✅ CORRECTION FINALE : Multiplicateur avec __none */}
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
                        <SelectItem value="__none">
                          Aucun multiplicateur
                        </SelectItem>
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
                <Label>Lot parent</Label>
                <Input
                  value={seedLot.parentLotId || "Aucun"}
                  disabled
                  className="bg-muted"
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
