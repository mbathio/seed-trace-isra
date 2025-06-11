// ===== 1. CORRECTION: frontend/src/pages/seeds/CreateSeedLot.tsx =====

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import { Variety, Multiplier, SeedLot } from "../../types/entities";
import * as yup from "yup";

// ✅ CORRECTION: Interface stricte pour le formulaire
interface CreateSeedLotForm {
  varietyId: number;
  level: "GO" | "G1" | "G2" | "G3" | "G4" | "R1" | "R2";
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  multiplierId?: number;
  parentLotId?: string;
  notes?: string;
  batchNumber?: string;
}

// ✅ CORRECTION: Schéma de validation simplifié
const seedLotValidationSchema = yup.object().shape({
  varietyId: yup.number().required("Variété requise").positive("ID invalide"),
  level: yup
    .string()
    .oneOf(["GO", "G1", "G2", "G3", "G4", "R1", "R2"])
    .required("Niveau requis"),
  quantity: yup
    .number()
    .required("Quantité requise")
    .positive("Quantité doit être positive"),
  productionDate: yup.string().required("Date de production requise"),
  expiryDate: yup.string().optional(),
  multiplierId: yup.number().optional().positive(),
  parentLotId: yup.string().optional(),
  notes: yup.string().optional().max(1000, "Notes trop longues"),
  batchNumber: yup.string().optional().max(50, "Numéro trop long"),
});

const CreateSeedLot: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ CORRECTION: Typage strict pour react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CreateSeedLotForm>({
    resolver: yupResolver(seedLotValidationSchema),
    defaultValues: {
      varietyId: 0,
      level: "GO",
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

      const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
      const currentIndex = levelHierarchy.indexOf(currentLevel);

      if (currentIndex <= 0) return [];

      const parentLevel = levelHierarchy[currentIndex - 1];
      const response = await api.get("/seed-lots", {
        params: { level: parentLevel, status: "CERTIFIED" },
      });
      return response.data.data;
    },
    enabled: !!watch("level"),
  });

  // ✅ CORRECTION: Mutation avec typage strict
  const createMutation = useMutation({
    mutationFn: async (data: CreateSeedLotForm) => {
      const response = await api.post("/seed-lots", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Lot de semences créé avec succès !");
      navigate(`/seeds/${data.data.id}`);
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la création du lot";
      toast.error(errorMessage);
    },
  });

  // ✅ CORRECTION: Handler avec typage correct
  const onSubmit: SubmitHandler<CreateSeedLotForm> = async (data) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Le reste du composant reste identique...
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
        {/* Reste du formulaire... */}
      </form>
    </div>
  );
};

export default CreateSeedLot;
