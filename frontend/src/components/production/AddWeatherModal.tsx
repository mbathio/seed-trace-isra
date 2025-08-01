// frontend/src/components/production/AddWeatherModal.tsx - VERSION CORRIGÉE

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Loader2, Cloud } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "react-toastify";

interface AddWeatherForm {
  recordDate: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed?: number;
  notes?: string;
  source?: string;
}

interface AddWeatherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionId: number;
  onSuccess: () => void;
}

export const AddWeatherModal: React.FC<AddWeatherModalProps> = ({
  open,
  onOpenChange,
  productionId,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddWeatherForm>({
    defaultValues: {
      recordDate: new Date().toISOString().split("T")[0],
      source: "Manuel",
      temperature: 0,
      rainfall: 0,
      humidity: 0,
    },
  });

  const addWeatherMutation = useMutation({
    mutationFn: async (data: AddWeatherForm) => {
      return api.post(`/productions/${productionId}/weather-data`, data);
    },
    onSuccess: () => {
      toast.success("Données météo ajoutées avec succès");
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de l'ajout des données météo";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: AddWeatherForm) => {
    addWeatherMutation.mutate(data);
  };

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2 text-blue-600" />
            Ajouter données météo
          </DialogTitle>
          <DialogDescription>
            Enregistrer les conditions météorologiques
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="recordDate">Date d'enregistrement *</Label>
            <Controller
              name="recordDate"
              control={control}
              rules={{ required: "Date requise" }}
              render={({ field }) => <Input type="date" {...field} />}
            />
            {errors.recordDate && (
              <p className="text-sm text-red-500">
                {errors.recordDate.message}
              </p>
            )}
          </div>

          {/* Température */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Température (°C) *</Label>
            <Controller
              name="temperature"
              control={control}
              rules={{
                required: "Température requise",
                min: { value: -50, message: "Température trop basse" },
                max: { value: 60, message: "Température trop élevée" },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.1"
                  placeholder="25.5"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {errors.temperature && (
              <p className="text-sm text-red-500">
                {errors.temperature.message}
              </p>
            )}
          </div>

          {/* Précipitations */}
          <div className="space-y-2">
            <Label htmlFor="rainfall">Précipitations (mm) *</Label>
            <Controller
              name="rainfall"
              control={control}
              rules={{
                required: "Précipitations requises",
                min: {
                  value: 0,
                  message: "Précipitations ne peuvent pas être négatives",
                },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.1"
                  placeholder="12.5"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {errors.rainfall && (
              <p className="text-sm text-red-500">{errors.rainfall.message}</p>
            )}
          </div>

          {/* Humidité */}
          <div className="space-y-2">
            <Label htmlFor="humidity">Humidité (%) *</Label>
            <Controller
              name="humidity"
              control={control}
              rules={{
                required: "Humidité requise",
                min: { value: 0, message: "Humidité minimum 0%" },
                max: { value: 100, message: "Humidité maximum 100%" },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="65"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {errors.humidity && (
              <p className="text-sm text-red-500">{errors.humidity.message}</p>
            )}
          </div>

          {/* Vitesse du vent */}
          <div className="space-y-2">
            <Label htmlFor="windSpeed">Vitesse du vent (km/h)</Label>
            <Controller
              name="windSpeed"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.1"
                  placeholder="15.2"
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              )}
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source des données</Label>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Input placeholder="Ex: Station météo, Manuel..." {...field} />
              )}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Observations particulières..."
                  className="min-h-[60px]"
                  {...field}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={addWeatherMutation.isPending}>
              {addWeatherMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ajouter les données
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
