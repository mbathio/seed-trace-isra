// frontend/src/pages/parcels/EditParcel.tsx

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { useParcel, useUpdateParcel } from "../../hooks/useParcels";
import { useMultipliers } from "../../hooks/useMultipliers";
import { PARCEL_STATUSES } from "../../constants";
import { parcelValidationSchema } from "../../utils/validators";
import { LocationPicker } from "../../components/map/LocationPicker";

const EditParcel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parcelId = parseInt(id!);

  const { data: parcel, isLoading } = useParcel(parcelId);
  const { data: multipliersData } = useMultipliers({ status: "active" });
  const updateMutation = useUpdateParcel();

  const multipliers = multipliersData?.data || [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(parcelValidationSchema),
    defaultValues: {
      name: "",
      area: 0,
      latitude: 0,
      longitude: 0,
      status: "available",
      soilType: "",
      irrigationSystem: "",
      address: "",
      multiplierId: undefined,
    },
  });

  // Remplir le formulaire avec les données existantes
  useEffect(() => {
    if (parcel) {
      reset({
        name: parcel.name || "",
        area: parcel.area,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        status: parcel.status,
        soilType: parcel.soilType || "",
        irrigationSystem: parcel.irrigationSystem || "",
        address: parcel.address || "",
        multiplierId: parcel.multiplierId,
      });
    }
  }, [parcel, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id: parcelId, data });
      navigate(`/dashboard/parcels/${parcelId}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Parcelle introuvable</p>
        <Button onClick={() => navigate("/dashboard/parcels")} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/parcels/${parcelId}`)}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier la parcelle</h1>
          <p className="text-muted-foreground">
            {parcel.name || `Parcelle ${parcel.code}`}
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
                Détails d'identification de la parcelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la parcelle</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="ex: Parcelle Nord, Champ A1..."
                      {...field}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Superficie (hectares) *</Label>
                <Controller
                  name="area"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
                {errors.area && (
                  <p className="text-sm text-red-500">{errors.area.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARCEL_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiplierId">Multiplicateur responsable</Label>
                <Controller
                  name="multiplierId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString() || "none"}
                      onValueChange={(value) =>
                        field.onChange(
                          value === "none" ? undefined : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un multiplicateur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
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
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques du sol */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques du sol</CardTitle>
              <CardDescription>
                Propriétés physiques et système d'irrigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="soilType">Type de sol</Label>
                <Controller
                  name="soilType"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: Argilo-limoneux" {...field} />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigationSystem">Système d'irrigation</Label>
                <Controller
                  name="irrigationSystem"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="ex: Goutte à goutte" {...field} />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Village, Commune, Région" {...field} />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Localisation géographique</CardTitle>
              <CardDescription>Position GPS de la parcelle</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="latitude"
                control={control}
                render={({ field: latField }) => (
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field: lngField }) => (
                      <LocationPicker
                        latitude={latField.value}
                        longitude={lngField.value}
                        onChange={({ latitude, longitude }) => {
                          latField.onChange(latitude);
                          lngField.onChange(longitude);
                        }}
                      />
                    )}
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/parcels/${parcelId}`)}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditParcel;
