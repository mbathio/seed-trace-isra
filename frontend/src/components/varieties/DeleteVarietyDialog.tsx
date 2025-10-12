import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

interface DeleteVarietyDialogProps {
  variety: { id: number; name: string };
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteVarietyDialog: React.FC<DeleteVarietyDialogProps> = ({
  variety,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Supprimer la variété
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-700 mb-4">
          Êtes-vous sûr de vouloir supprimer la variété{" "}
          <span className="font-semibold">{variety.name}</span> ? <br />
          Cette action est <strong>irréversible</strong>.
        </p>
        <DialogFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
