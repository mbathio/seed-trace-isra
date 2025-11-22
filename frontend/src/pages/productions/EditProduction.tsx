// frontend/src/pages/productions/EditProduction.tsx

import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react";

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
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { PRODUCTION_STATUSES, getStatusConfig } from "../../constants";
import { Production } from "../../types/entities";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";

// ✅ Schéma Yup d'abord
const editProductionSchema = yup.object({
  status: yup
    .string()
    .oneOf(PRODUCTION_STATUSES.map((s) => s.value))
    .required("Le statut est obligatoire"),
  startDate: yup.string().required("La date de début est obligatoire").max(10),
  endDate: yup.string().nullable().max(10),
  sowingDate: yup.string().nullable().max(10),
  harvestDate: yup.string().nullable().max(10),
  plannedQuantity: yup
    .number()
    .typeError("La quantité prévue doit être un nombre")
    .nullable()
    .min(0, "La quantité prévue doit être positive")
    .notRequired(),
  actualYield: yup
    .number()
    .typeError("Le rendement doit être un nombre")
    .nullable()
    .min(0, "Le rendement doit être positif")
    .notRequired(),
  notes: yup.string().nullable().notRequired(),
  weatherConditions: yup.string().nullable().notRequired(),
});

// ✅ Le type TS dérive automatiquement du schéma
type EditProductionForm = yup.InferType<typeof editProductionSchema>;

const normalizeStatus = (
  status: string | null | undefined
): string | undefined => {
  if (!status) return undefined;

  const lower = status.toLowerCase().trim();

  if (["planned", "planifie", "planifiée"].includes(lower)) return "planned";
  if (["in_progress", "in-progress", "en cours", "en_cours"].includes(lower))
    return "in-progress";
  if (["completed", "terminee", "terminée"].includes(lower)) return "completed";
  if (["cancelled, annulee", "annulée"].includes(lower)) return "cancelled";

  return undefined;
};

// ✅ Styles locaux pour les statuts (au lieu de badgeClass / dotClass sur StatusConfig)
const STATUS_STYLES: Record<
  Production["status"],
  { badgeClass: string; dotClass: string }
> = {
  planned: {
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
    dotClass: "bg-blue-500",
  },
  "in-progress": {
    badgeClass: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dotClass: "bg-yellow-500",
  },
  completed: {
    badgeClass: "bg-green-50 text-green-700 border border-green-200",
    dotClass: "bg-green-500",
  },
  cancelled: {
    badgeClass: "bg-gray-100 text-gray-700 border border-gray-300",
    dotClass: "bg-gray-500",
  },
};

const EditProduction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditProductionForm>({
    resolver: yupResolver<EditProductionForm>(editProductionSchema),
    defaultValues: {
      status: "planned",
      startDate: "",
      endDate: undefined,
      sowingDate: undefined,
      harvestDate: undefined,
      plannedQuantity: undefined,
      actualYield: undefined,
      notes: "",
      weatherConditions: "",
    },
  });

  const [production, setProduction] = React.useState<Production | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchProduction = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const res = await api.get<{ data: Production }>(`/productions/${id}`);
      const prod = res.data.data;
      setProduction(prod);

      reset({
        status: normalizeStatus(prod.status) ?? "planned",
        startDate: prod.startDate ? prod.startDate.substring(0, 10) : "",
        endDate: prod.endDate ? prod.endDate.substring(0, 10) : undefined,
        sowingDate: prod.sowingDate
          ? prod.sowingDate.substring(0, 10)
          : undefined,
        harvestDate: prod.harvestDate
          ? prod.harvestDate.substring(0, 10)
          : undefined,
        plannedQuantity: prod.plannedQuantity ?? undefined,
        actualYield: prod.actualYield ?? undefined,
        notes: prod.notes ?? "",
        weatherConditions: prod.weatherConditions ?? "",
      });
    } catch (error: any) {
      console.error("Erreur lors du chargement de la production:", error);
      const message =
        error?.response?.data?.message ||
        "Erreur lors du chargement de la production";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit: SubmitHandler<EditProductionForm> = async (data) => {
    if (!id) return;

    try {
      const payload = {
        ...data,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        sowingDate: data.sowingDate || null,
        harvestDate: data.harvestDate || null,
        plannedQuantity:
          data.plannedQuantity === undefined || data.plannedQuantity === null
            ? null
            : data.plannedQuantity,
        actualYield:
          data.actualYield === undefined || data.actualYield === null
            ? null
            : data.actualYield,
        notes: data.notes || null,
        weatherConditions: data.weatherConditions || null,
      };

      await api.put(`/productions/${id}`, payload);

      toast.success("Production mise à jour avec succès");
      navigate(`/dashboard/productions/${id}`);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la production:", error);
      const message =
        error?.response?.data?.message ||
        "Erreur lors de la mise à jour de la production";
      toast.error(message);
    }
  };

  const currentStatusConfig = useMemo(
    () =>
      getStatusConfig(
        normalizeStatus(production?.status || "") || "planned",
        PRODUCTION_STATUSES
      ),
    [production]
  );

  // ✅ Style du badge courant basé sur le statut normalisé
  const normalizedStatusForStyle =
    normalizeStatus(production?.status || "") || "planned";
  const currentStatusStyle =
    STATUS_STYLES[normalizedStatusForStyle as Production["status"]];

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Non renseignée";
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: fr });
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <span className="text-gray-700">
              Chargement des informations de la production...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!production) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-yellow-500" />
            <CardTitle className="mb-2">
              Production introuvable ou inaccessible
            </CardTitle>
            <CardDescription className="mb-4">
              La production que vous essayez de modifier n&apos;existe pas ou
              n&apos;est pas accessible.
            </CardDescription>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/productions")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste des productions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Modifier la production #{production.id}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Mise à jour des informations de la campagne de production.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${currentStatusStyle.badgeClass}`}
          >
            <span className="mr-1 h-2 w-2 rounded-full bg-current opacity-80" />
            {currentStatusConfig.label}
          </span>
        </div>
      </div>

      {/* Info contexte production */}
      <Card className="border border-primary/10 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Informations de contexte
          </CardTitle>
          <CardDescription>
            Quelques informations clés sur cette production pour vous aider dans
            la mise à jour.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Parcelle
            </p>
            <p className="text-gray-800">
              {production.parcel?.name || "Non renseigné"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Lot de semences
            </p>
            <p className="text-gray-800">
              {production.seedLot
                ? `${production.seedLot.id}${
                    production.seedLot.variety?.name
                      ? ` - ${production.seedLot.variety.name}`
                      : ""
                  }`
                : "Non renseigné"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Période actuelle
            </p>
            <p className="text-gray-800">
              Début : {formatDate(production.startDate)}{" "}
              {production.endDate && (
                <> · Fin : {formatDate(production.endDate)}</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]"
      >
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Statut + dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Statut et planification
              </CardTitle>
              <CardDescription>
                Mettez à jour le statut de la production et ses principales
                dates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statut */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Statut de la production
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCTION_STATUSES.map((status) => {
                          const statusKey =
                            status.value as Production["status"];
                          const style =
                            STATUS_STYLES[statusKey] || STATUS_STYLES.planned;
                          return (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${style.dotClass}`}
                                />
                                <span>{status.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Date de début
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        className="mt-1"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Date de fin (optionnelle)
                  </label>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        className="mt-1"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Dates de semis et récolte */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Date de semis (optionnelle)
                  </label>
                  <Controller
                    name="sowingDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        className="mt-1"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {errors.sowingDate && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.sowingDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Date de récolte
                  </label>
                  <Controller
                    name="harvestDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        className="mt-1"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value || undefined)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {errors.harvestDate && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.harvestDate.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantités & rendements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Quantités et rendements
              </CardTitle>
              <CardDescription>
                Renseignez les objectifs et résultats de la production.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Quantité prévue (kg)
                  </label>
                  <Controller
                    name="plannedQuantity"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="mt-1"
                        value={
                          field.value !== undefined && field.value !== null
                            ? field.value
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseFloat(value)
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {errors.plannedQuantity && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.plannedQuantity.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Rendement réel (kg)
                  </label>
                  <Controller
                    name="actualYield"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="mt-1"
                        value={
                          field.value !== undefined && field.value !== null
                            ? field.value
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseFloat(value)
                          );
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    )}
                  />
                  {errors.actualYield && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.actualYield.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Conditions météo & notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes et météo</CardTitle>
              <CardDescription>
                Ajoutez des notes de suivi et les conditions climatiques
                observées.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Conditions météorologiques
                </label>
                <Controller
                  name="weatherConditions"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      className="mt-1"
                      rows={3}
                      placeholder="Ex : Pluviométrie élevée au semis, sécheresse à la floraison..."
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  )}
                />
                {errors.weatherConditions && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.weatherConditions.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes de suivi
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      className="mt-1"
                      rows={5}
                      placeholder="Ajoutez des notes sur le déroulement de la production, les contraintes rencontrées, etc."
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  )}
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.notes.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/dashboard/productions/${id}`)}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduction;
