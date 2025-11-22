// frontend/src/pages/seeds/EditSeedLot.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Package } from "lucide-react";
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
import type {
  SeedLot,
  Variety,
  Multiplier,
  Parcel,
} from "../../types/entities";
import type { ApiResponse } from "../../types/api";
import { LOT_STATUSES } from "../../constants";
import { yupResolver } from "@hookform/resolvers/yup";
import { seedLotValidationSchema } from "../../utils/validators";

// Interface pour le formulaire de modification
interface EditSeedLotForm {
  varietyId: number;
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  quantity: number;
  productionDate: string; // Format YYYY-MM-DD pour les inputs date
  expiryDate?: string; // Format YYYY-MM-DD pour les inputs date
  status?: string;
  notes?: string;
  batchNumber?: string;
  multiplierId?: number;
  parcelId?: number;
}

const EditSeedLot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupération du lot existant
  const { data: seedLotResponse, isLoading: seedLotLoading } = useQuery<
    ApiResponse<SeedLot>
  >({
    queryKey: ["seed-lot", id],
    queryFn: async () => {
      if (!id) throw new Error("ID manquant");
      return await seedLotService.getById(id);
    },
    enabled: !!id,
  });

  const seedLot = seedLotResponse?.data;

  // Récupération des variétés
  const { data: varietiesResponse, isLoading: varietiesLoading } = useQuery<
    ApiResponse<Variety[]>
  >({
    queryKey: ["varieties-for-edit"],
    queryFn: async () => {
      const response = await api.get("/varieties", {
        params: { pageSize: 100 },
      });
      return response.data;
    },
  });

  const varieties = varietiesResponse?.data || [];

  // Récupération des multiplicateurs
  const { data: multipliersResponse, isLoading: multipliersLoading } = useQuery<
    ApiResponse<Multiplier[]>
  >({
    queryKey: ["multipliers-for-edit"],
    queryFn: async () => {
      const response = await api.get("/multipliers", {
        params: { pageSize: 100, status: "active" },
      });
      return response.data;
    },
  });

  const multipliers = multipliersResponse?.data || [];

  // Récupération des parcelles
  const { data: parcelsResponse, isLoading: parcelsLoading } = useQuery<
    ApiResponse<Parcel[]>
  >({
    queryKey: ["parcels-for-edit"],
    queryFn: async () => {
      const response = await api.get("/parcels", {
        params: {
          pageSize: 100,
          includeRelations: true, // même logique que la liste des parcelles
        },
      });
      return response.data;
    },
  });

  const parcels = parcelsResponse?.data || [];

  // Configuration du formulaire avec les valeurs par défaut
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditSeedLotForm>({
    resolver: yupResolver(seedLotValidationSchema),
    defaultValues: {
      varietyId: 0,
      level: "G1",
      quantity: 0,
      productionDate: "",
      expiryDate: "",
      status: "pending",
      notes: "",
      batchNumber: "",
      multiplierId: undefined,
      parcelId: undefined,
    },
  });

  // Fonction pour convertir une date ISO en format YYYY-MM-DD
  const formatDateForInput = (
    dateString: string | undefined | null
  ): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Remplir le formulaire avec les données existantes
  useEffect(() => {
    if (seedLot) {
      console.log("Setting form values from seedLot:", seedLot);

      reset({
        varietyId: seedLot.variety?.id || 0,
        level: seedLot.level as any,
        quantity: seedLot.quantity,
        productionDate: formatDateForInput(seedLot.productionDate),
        expiryDate: formatDateForInput(seedLot.expiryDate),
        status: seedLot.status,
        notes: seedLot.notes || "",
        batchNumber: seedLot.batchNumber || "",
        multiplierId: seedLot.multiplier?.id,
        parcelId: seedLot.parcel?.id,
      });
    }
  }, [seedLot, reset]);

  // Mutation pour la mise à jour
  const updateMutation = useMutation({
    mutationFn: async (data: EditSeedLotForm) => {
      if (!id) throw new Error("ID manquant");

      // Préparer les données pour l'API
      const updateData: any = {
        quantity: data.quantity,
        notes: data.notes || null,
        batchNumber: data.batchNumber || null,
        multiplierId: data.multiplierId || null,
        parcelId: data.parcelId || null,
      };

      // Ajouter la date d'expiration si modifiée
      if (
        data.expiryDate &&
        data.expiryDate !== formatDateForInput(seedLot?.expiryDate)
      ) {
        updateData.expiryDate = data.expiryDate;
      }

      // Ajouter le statut si modifié
      if (data.status && data.status !== seedLot?.status) {
        updateData.status = data.status;
      }

      console.log("Sending update data:", updateData);

      const response = await seedLotService.update(id, updateData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Lot mis à jour avec succès !");
      navigate(`/dashboard/seed-lots/${id}`);
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la mise à jour du lot";
      toast.error(errorMessage);
    },
  });

  const onSubmit: SubmitHandler<EditSeedLotForm> = async (data) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // États de chargement
  if (
    seedLotLoading ||
    varietiesLoading ||
    multipliersLoading ||
    parcelsLoading
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Erreur si le lot n'existe pas
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
          <h1 className="text-3xl font-bold flex items-center">
            <Package className="h-8 w-8 mr-3 text-green-600" />
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
                Certains champs ne peuvent pas être modifiés après création
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="varietyId">Variété (non modifiable)</Label>
                <Input
                  value={seedLot.variety?.name || "Non spécifiée"}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Niveau (non modifiable)</Label>
                <Input value={seedLot.level} disabled className="bg-muted" />
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
            </CardContent>
          </Card>

          {/* Informations de production */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de production</CardTitle>
              <CardDescription>
                Dates et acteurs de la production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productionDate">
                  Date de production (non modifiable)
                </Label>
                <Input
                  type="date"
                  value={formatDateForInput(seedLot.productionDate)}
                  disabled
                  className="bg-muted"
                />
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
                <Label htmlFor="parcelId">Parcelle</Label>
                <Controller
                  name="parcelId"
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
                        <SelectValue placeholder="Sélectionner une parcelle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Aucune parcelle</SelectItem>
                        {parcels.map((parcel) => (
                          <SelectItem
                            key={parcel.id}
                            value={parcel.id.toString()}
                          >
                            {parcel.name || `Parcelle ${parcel.id}`}
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
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="bg-green-600 hover:bg-green-700"
          >
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
