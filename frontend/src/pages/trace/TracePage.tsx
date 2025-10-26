// frontend/src/pages/trace/TracePage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { seedLotService } from "../../services/seedLotService";
import {
  Loader2,
  AlertTriangle,
  Package,
  Leaf,
  MapPin,
  Calendar,
  User,
  FileText,
} from "lucide-react";

const TracePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: lot,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trace-lot", id],
    queryFn: async () => {
      if (!id) throw new Error("ID manquant");
      const response = await seedLotService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
        <p>Chargement des informations du lot...</p>
      </div>
    );
  }

  if (error || !lot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold">Lot introuvable</h2>
        <p className="text-gray-500 mt-2">
          Aucune donnée trouvée pour l’identifiant <b>{id}</b>.
        </p>
      </div>
    );
  }

  const dateProd = new Date(lot.productionDate).toLocaleDateString("fr-FR");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
              <Package className="h-8 w-8 text-green-600" />
              {lot.id}
            </h1>
            <p className="text-gray-500 mt-1">
              Niveau : <b>{lot.level}</b> — Statut :{" "}
              <b className="text-green-700">{lot.status}</b>
            </p>
          </div>
          <img
            src="/logo-isra.png"
            alt="ISRA"
            className="h-14 mt-4 sm:mt-0 sm:h-16"
          />
        </div>

        {/* Informations principales */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Leaf className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Variété</p>
              <p className="font-medium">{lot.variety?.name || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Multiplicateur</p>
              <p className="font-medium">{lot.multiplier?.name || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Parcelle</p>
              <p className="font-medium">{lot.parcel?.code || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Date de production</p>
              <p className="font-medium">{dateProd}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Quantité totale</p>
              <p className="font-medium">{lot.quantity} kg</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="font-medium">{lot.notes || "Aucune note"}</p>
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-400 text-sm mt-10 border-t pt-4">
          Institut Sénégalais de Recherches Agricoles (ISRA) — CRA Saint-Louis
        </footer>
      </div>
    </div>
  );
};

export default TracePage;
