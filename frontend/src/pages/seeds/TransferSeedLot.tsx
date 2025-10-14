// frontend/src/pages/seeds/TransferSeedLot.tsx — MAPPING MULTIPLICATEURS CORRIGÉ ✅
import React, { useState, useMemo } from "react";
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

const prettyCert = (cert?: string) => {
  if (!cert) return "—";
  switch (cert.toLowerCase()) {
    case "beginner":
      return "Débutant";
    case "intermediate":
      return "Intermédiaire";
    case "expert":
      return "Expert";
    default:
      return cert;
  }
};

const TransferSeedLot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lot
  const { data: seedLotData, isLoading: loadingSeedLot } = useQuery<
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

  // Multiplicateurs (renvoyés dans `data` + `meta`) :contentReference[oaicite:2]{index=2}
  const { data: multipliersResp, isLoading: loadingMultipliers } = useQuery<
    ApiResponse<Multiplier[]>
  >({
    queryKey: ["multipliers-for-transfer", "active"],
    queryFn: async () => {
      // Filtre côté service par statut actif, pagination correcte :contentReference[oaicite:3]{index=3}
      const res = await api.get("/multipliers", {
        params: {
          pageSize: 200,
          status: "active",
          sortBy: "name",
          sortOrder: "asc",
        },
      });
      return res.data;
    },
  });
  const multipliers = multipliersResp?.data ?? [];

  // Formulaire
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransferForm>({
    defaultValues: {
      targetMultiplierId: 0,
      quantity: 0,
      notes: "",
    },
  });

  const watchedQuantity = watch("quantity");
  const currentMultiplierId = seedLot?.multiplier?.id;

  // Options propres (exclut propriétaire, tri par nom au cas où)
  const multiplierOptions = useMemo(() => {
    return multipliers
      .filter((m) => m && m.id !== currentMultiplierId)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      .map((m) => {
        // Comptages s'ils existent (_count exposé par le service) :contentReference[oaicite:4]{index=4}
        const contracts =
          (m as any)._count?.contracts ??
          (m as any).contracts?.length ??
          undefined;
        const lots =
          (m as any)._count?.seedLots ??
          (m as any).seedLots?.length ??
          undefined;
        const extra =
          contracts != null || lots != null
            ? ` (${contracts != null ? `${contracts} contrat(s)` : ""}${
                contracts != null && lots != null ? ", " : ""
              }${lots != null ? `${lots} lot(s)` : ""})`
            : "";
        const label = `${m.name} — ${prettyCert(
          (m as any).certificationLevel
        )}${extra}`;
        return { value: m.id.toString(), label };
      });
  }, [multipliers, currentMultiplierId]);

  // Mutation
  const transferMutation = useMutation({
    mutationFn: async (formData: TransferForm) => {
      if (!id) throw new Error("ID manquant");
      const payload = {
        targetMultiplierId: Number(formData.targetMultiplierId),
        quantity: Number(formData.quantity),
        notes: formData.notes?.trim() || undefined,
      };
      const response = await seedLotService.transferLot(id, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("✅ Lot transféré avec succès !");
      navigate(`/dashboard/seed-lots/${id}`);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Erreur lors du transfert du lot";
      toast.error(msg);
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

  if (loadingSeedLot || loadingMultipliers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!seedLot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertDescription>Lot de semences non trouvé.</AlertDescription>
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
            Transférer le lot <strong>{seedLot.id}</strong> vers un autre
            multiplicateur
          </p>
        </div>
      </div>

      {/* Infos lot */}
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
              <p className="text-sm text-muted-foreground">Quantité dispo</p>
              <p className="font-medium">
                {formatNumber(availableQuantity)} kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails du transfert</CardTitle>
            <CardDescription>
              Choisissez le destinataire et la quantité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Multiplicateur destinataire */}
            <div className="space-y-2">
              <Label>Multiplicateur destinataire *</Label>
              <Controller
                name="targetMultiplierId"
                control={control}
                rules={{ required: "Multiplicateur requis" }}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un multiplicateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {multiplierOptions.length > 0 ? (
                        multiplierOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Aucun multiplicateur actif trouvé
                        </div>
                      )}
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

            {/* Quantité */}
            <div className="space-y-2">
              <Label>Quantité à transférer (kg) *</Label>
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: "Quantité requise",
                  min: { value: 0.1, message: "Min: 0.1 kg" },
                  max: {
                    value: availableQuantity,
                    message: `Max: ${formatNumber(availableQuantity)} kg`,
                  },
                }}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="0.1"
                    value={field.value ?? 0}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    placeholder={`Max: ${formatNumber(availableQuantity)} kg`}
                  />
                )}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
                </p>
              )}
              {watchedQuantity > 0 && (
                <p className="text-sm text-muted-foreground">
                  Restant après transfert :{" "}
                  {formatNumber(availableQuantity - watchedQuantity)} kg
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Raison du transfert, conditions particulières…"
                    className="min-h-[100px]"
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
            disabled={
              isSubmitting ||
              !watchedQuantity ||
              watchedQuantity > availableQuantity
            }
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
