// frontend/src/pages/seeds/CreateSeedLot.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { seedLotValidationSchema } from "../../utils/validators";
import { Variety, Multiplier, SeedLot } from "../../types/entities";

interface CreateSeedLotForm {
  varietyId: number;
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  multiplierId?: number;
  parcelId?: number;
  parentLotId?: string;
  notes?: string;
  batchNumber?: string;
}

interface CreateSeedLotResponse {
  data: SeedLot;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
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

      // Get possible parent levels (previous generation)
      const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
      const currentIndex = levelHierarchy.indexOf(currentLevel);

      if (currentIndex <= 0) return [];

      const parentLevel = levelHierarchy[currentIndex - 1];
      const response = await api.get("/seeds", {
        params: { level: parentLevel, status: "certified" },
      });
      return response.data.data;
    },
    enabled: !!watch("level"),
  });

  const createMutation = useMutation<
    CreateSeedLotResponse,
    Error,
    CreateSeedLotForm
  >({
    mutationFn: async (data: CreateSeedLotForm) => {
      const response = await api.post("/seeds", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Lot de semences créé avec succès !");
      navigate(`/seeds/${data.data.id}`);
    },
    onError: (error: Error) => {
      console.error("Create error:", error);
      const errorResponse = error as ErrorResponse;
      const errorMessage =
        errorResponse?.response?.data?.message ||
        errorResponse?.message ||
        "Erreur lors de la création du lot";
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: CreateSeedLotForm) => {
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
          <h1 className="text-3xl font-bold">Créer un lot de semences</h1>
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
                      value={field.value?.toString()}
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
                <Label htmlFor="level">Niveau de génération *</Label>
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
                      placeholder="0.0"
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
                    <Input placeholder="B-2024-001" {...field} />
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  Numéro d'identification du lot (optionnel)
                </p>
                {errors.batchNumber && (
                  <p className="text-sm text-red-500">
                    {errors.batchNumber.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates et traçabilité */}
          <Card>
            <CardHeader>
              <CardTitle>Dates et traçabilité</CardTitle>
              <CardDescription>
                Informations temporelles et généalogie
              </CardDescription>
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
                <p className="text-sm text-muted-foreground">
                  Date limite d'utilisation (optionnelle)
                </p>
                {errors.expiryDate && (
                  <p className="text-sm text-red-500">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>

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
                        <SelectValue placeholder="Sélectionner le lot parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun parent</SelectItem>
                        {parentLots?.map((lot) => (
                          <SelectItem key={lot.id} value={lot.id}>
                            {lot.id} - {lot.variety.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  Lot source pour établir la généalogie
                </p>
                {errors.parentLotId && (
                  <p className="text-sm text-red-500">
                    {errors.parentLotId.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Production et localisation */}
          <Card>
            <CardHeader>
              <CardTitle>Production et localisation</CardTitle>
              <CardDescription>
                Informations sur le producteur et la parcelle
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
                        <SelectItem value="">Aucun multiplicateur</SelectItem>
                        {multipliers?.map((multiplier) => (
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
                <p className="text-sm text-muted-foreground">
                  Producteur responsable du lot (optionnel)
                </p>
                {errors.multiplierId && (
                  <p className="text-sm text-red-500">
                    {errors.multiplierId.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes et observations */}
          <Card>
            <CardHeader>
              <CardTitle>Notes et observations</CardTitle>
              <CardDescription>Informations complémentaires</CardDescription>
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
                <p className="text-sm text-muted-foreground">
                  Notes libres sur le lot (optionnel)
                </p>
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
