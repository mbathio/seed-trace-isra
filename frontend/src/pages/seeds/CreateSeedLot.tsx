// frontend/src/pages/seeds/CreateSeedLot.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
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

  const form = useForm<CreateSeedLotForm>({
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
    queryKey: ["parent-lots", form.watch("level")],
    queryFn: async () => {
      const currentLevel = form.getValues("level");
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
    enabled: !!form.watch("level"),
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormField
                  control={form.control}
                  name="varietyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variété *</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une variété" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau de génération *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEED_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité (kg) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de lot</FormLabel>
                      <FormControl>
                        <Input placeholder="B-2024-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Numéro d'identification du lot (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="productionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de production *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'expiration</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Date limite d'utilisation (optionnelle)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentLotId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot parent</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le lot parent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Aucun parent</SelectItem>
                          {parentLots?.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.id} - {lot.variety.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Lot source pour établir la généalogie
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="multiplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Multiplicateur</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) =>
                          field.onChange(value ? parseInt(value) : undefined)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un multiplicateur" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormDescription>
                        Producteur responsable du lot (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notes et observations */}
            <Card>
              <CardHeader>
                <CardTitle>Notes et observations</CardTitle>
                <CardDescription>Informations complémentaires</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observations, conditions particulières, remarques..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Notes libres sur le lot (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
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
              onClick={() => navigate("/seeds")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Créer le lot
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateSeedLot;
