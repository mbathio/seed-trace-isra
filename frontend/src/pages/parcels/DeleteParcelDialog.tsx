// frontend/src/components/parcels/DeleteParcelDialog.tsx

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useDeleteParcel } from "../../hooks/useParcels";
import { Parcel } from "../../types/entities";

interface DeleteParcelDialogProps {
  parcel: Parcel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteParcelDialog: React.FC<DeleteParcelDialogProps> = ({
  parcel,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const deleteMutation = useDeleteParcel();

  const handleDelete = async () => {
    if (!parcel) return;

    try {
      await deleteMutation.mutateAsync(parcel.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la parcelle{" "}
            <strong>{parcel?.name || `Parcelle ${parcel?.code}`}</strong> ?
            <br />
            <br />
            Cette action est irréversible et supprimera toutes les données
            associées (analyses de sol, historique des productions, etc.).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
