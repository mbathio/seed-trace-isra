// frontend/src/components/production/AddIssueModal.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "../ui/checkbox";
import { Loader2, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { ISSUE_TYPES, ISSUE_SEVERITIES } from "../../constants";
import { productionIssueValidationSchema } from "../../utils/validators";

interface AddIssueForm {
  issueDate: string;
  type: string;
  severity: string;
  description: string;
  actions: string;
  resolved: boolean;
  resolvedDate?: string;
  cost?: number;
}

interface AddIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productionId: number;
  onSuccess: () => void;
}

export const AddIssueModal: React.FC<AddIssueModalProps> = ({
  open,
  onOpenChange,
  productionId,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddIssueForm>({
    resolver: yupResolver(productionIssueValidationSchema),
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      resolved: false,
    },
  });

  const resolved = watch("resolved");

  const addIssueMutation = useMutation({
    mutationFn: async (data: AddIssueForm) => {
      const payload = {
        ...data,
        productionId,
      };
      return api.post(`/productions/${productionId}/issues`, payload);
    },
    onSuccess: () => {
      toast.success("Problème signalé avec succès");
      reset();
      onSuccess();
    },
    onError: () => {
      toast.error("Erreur lors du signalement du problème");
    },
  });

  const onSubmit = (data: AddIssueForm) => {
    addIssueMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Signaler un problème
          </DialogTitle>
          <DialogDescription>
            Enregistrer un incident ou problème rencontré pendant la production
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Date du problème *</Label>
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
              {errors.issueDate && (
                <p className="text-sm text-red-500">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de problème *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon && (
                            <span className="mr-2">{type.icon}</span>
                          )}
                          {type.label}
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
          </div>

          {/* Sévérité */}
          <div className="space-y-2">
            <Label htmlFor="severity">Niveau de sévérité *</Label>
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la sévérité" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_SEVERITIES.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {severity.icon && (
                          <span className="mr-2">{severity.icon}</span>
                        )}
                        {severity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.severity && (
              <p className="text-sm text-red-500">{errors.severity.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description du problème *</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Décrivez le problème rencontré..."
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

          {/* Actions */}
          <div className="space-y-2">
            <Label htmlFor="actions">Actions prises *</Label>
            <Controller
              name="actions"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Décrivez les actions entreprises pour résoudre le problème..."
                  className="min-h-[80px]"
                  {...field}
                />
              )}
            />
            {errors.actions && (
              <p className="text-sm text-red-500">{errors.actions.message}</p>
            )}
          </div>

          {/* Coût */}
          <div className="space-y-2">
            <Label htmlFor="cost">Coût estimé (FCFA)</Label>
            <Controller
              name="cost"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>

          {/* Résolution */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="resolved"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label>Problème résolu</Label>
            </div>

            {resolved && (
              <div className="space-y-2">
                <Label htmlFor="resolvedDate">Date de résolution</Label>
                <Controller
                  name="resolvedDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value || new Date().toISOString().split("T")[0]
                      }
                    />
                  )}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={addIssueMutation.isPending}>
              {addIssueMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Signaler le problème
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
