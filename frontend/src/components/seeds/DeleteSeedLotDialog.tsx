// frontend/src/components/seeds/DeleteSeedLotDialog.tsx
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
} from "../ui/alert-dialog";
import { SeedLot } from "../../types/entities";

export interface DeleteSeedLotDialogProps {
  seedLot?: SeedLot;
  seedLotId?: string; // Pour la compatibilité
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteSeedLotDialog: React.FC<DeleteSeedLotDialogProps> = ({
  seedLot,
  seedLotId,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const lotNumber = seedLot?.id || seedLotId || "";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le lot{" "}
            <strong>{lotNumber}</strong> ? Cette action est irréversible et
            supprimera toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
