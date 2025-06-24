// frontend/src/components/production/AddActivityModal.tsx - VERSION CORRIGÉE
import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Plus, Loader2, X } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { ACTIVITY_TYPES } from "../../constants";
import { productionActivityValidationSchema } from "../../utils/validators";

interface ActivityInput {
  name: string;
  quantity: string;
  unit: string;
  cost?: number;
}

// ✅ CORRIGÉ: Interface mise à jour avec productionId requis
interface AddActivityForm {
  type: string;
  activityDate: string;
  description: string;
  personnel: string[];
  notes?: string;
  inputs: ActivityInput[];
  productionId: number; // ✅ AJOUTÉ: Champ requis par le schema de validation
}

interface AddActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionId: number;
  onSuccess: () => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  open,
  onOpenChange,
  productionId,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddActivityForm>({
    resolver: yupResolver(productionActivityValidationSchema),
    defaultValues: {
      activityDate: new Date().toISOString().split("T")[0],
      personnel: [""],
      inputs: [],
      productionId, // ✅ AJOUTÉ: Valeur par défaut
    },
  });

  const inputs = watch("inputs") || [];
  const personnel = watch("personnel") || [""];

  const addActivityMutation = useMutation({
    mutationFn: async (data: AddActivityForm) => {
      const payload = {
        ...data,
        productionId,
        personnel: data.personnel.filter((p) => p.trim() !== ""),
      };
      return api.post(`/productions/${productionId}/activities`, payload);
    },
    onSuccess: () => {
      toast.success("Activité ajoutée avec succès");
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de l'ajout de l'activité";
      toast.error(errorMessage);
    },
  });

  // ✅ CORRIGÉ: Type explicite pour SubmitHandler
  const onSubmit: SubmitHandler<AddActivityForm> = (data: AddActivityForm) => {
    addActivityMutation.mutate(data);
  };

  const addPersonnel = () => {
    setValue("personnel", [...personnel, ""]);
  };

  const removePersonnel = (index: number) => {
    if (personnel.length > 1) {
      setValue(
        "personnel",
        personnel.filter((_, i) => i !== index)
      );
    }
  };

  const updatePersonnel = (index: number, value: string) => {
    const newPersonnel = [...personnel];
    newPersonnel[index] = value;
    setValue("personnel", newPersonnel);
  };

  const addInput = () => {
    setValue("inputs", [
      ...inputs,
      { name: "", quantity: "", unit: "", cost: 0 },
    ]);
  };

  const removeInput = (index: number) => {
    setValue(
      "inputs",
      inputs.filter((_, i) => i !== index)
    );
  };

  const updateInput = (
    index: number,
    field: keyof ActivityInput,
    value: string | number
  ) => {
    const newInputs = [...inputs];
    if (field === "cost") {
      newInputs[index] = { ...newInputs[index], [field]: Number(value) };
    } else {
      newInputs[index] = { ...newInputs[index], [field]: value };
    }
    setValue("inputs", newInputs);
  };

  // Réinitialiser le formulaire quand le modal se ferme
  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une activité</DialogTitle>
          <DialogDescription>
            Enregistrer une nouvelle activité de production agricole
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type d'activité *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            {type.icon && <span>{type.icon}</span>}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityDate">Date d'activité *</Label>
              <Controller
                name="activityDate"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    {...field}
                    max={new Date().toISOString().split("T")[0]} // Pas de date future
                  />
                )}
              />
              {errors.activityDate && (
                <p className="text-sm text-red-500">
                  {errors.activityDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Décrivez l'activité réalisée en détail..."
                  className="min-h-[80px]"
                  {...field}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Personnel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Personnel impliqué *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPersonnel}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter personne
              </Button>
            </div>
            <div className="space-y-2">
              {personnel.map((person, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Nom de la personne"
                    value={person}
                    onChange={(e) => updatePersonnel(index, e.target.value)}
                    className="flex-1"
                  />
                  {personnel.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePersonnel(index)}
                      className="h-10 w-10 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.personnel && (
              <p className="text-sm text-red-500">{errors.personnel.message}</p>
            )}
          </div>

          {/* Intrants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Intrants utilisés</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInput}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter intrant
              </Button>
            </div>

            {inputs.length > 0 && (
              <div className="space-y-3">
                {inputs.map((input, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        Intrant #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeInput(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nom de l'intrant</Label>
                        <Input
                          placeholder="Ex: Urée, NPK..."
                          value={input.name}
                          onChange={(e) =>
                            updateInput(index, "name", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Quantité</Label>
                        <Input
                          placeholder="50"
                          value={input.quantity}
                          onChange={(e) =>
                            updateInput(index, "quantity", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Unité</Label>
                        <Select
                          value={input.unit}
                          onValueChange={(value) =>
                            updateInput(index, "unit", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Unité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="litres">litres</SelectItem>
                            <SelectItem value="sacs">sacs</SelectItem>
                            <SelectItem value="tonnes">tonnes</SelectItem>
                            <SelectItem value="unités">unités</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Coût (FCFA)</Label>
                        <Input
                          type="number"
                          placeholder="15000"
                          value={input.cost || ""}
                          onChange={(e) =>
                            updateInput(index, "cost", e.target.value)
                          }
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {inputs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                Aucun intrant ajouté. Cliquez sur "Ajouter intrant" pour
                commencer.
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes complémentaires</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Observations, remarques, conditions particulières..."
                  className="min-h-[60px]"
                  {...field}
                />
              )}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addActivityMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={addActivityMutation.isPending}
              className="min-w-[120px]"
            >
              {addActivityMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter l'activité
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
