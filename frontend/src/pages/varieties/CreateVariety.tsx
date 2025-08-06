// frontend/src/pages/varieties/CreateVariety.tsx - VERSION COMPLÈTE
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useApiMutation } from "../../hooks/useApi";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { toast } from "react-toastify";

// Types
interface CreateVarietyData {
  code: string;
  name: string;
  cropType: string;
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  resistances: string[];
  origin?: string;
  releaseYear?: number;
}

// Configuration des types de cultures
const cropTypes = [
  { value: "rice", label: "Riz" },
  { value: "maize", label: "Maïs" },
  { value: "peanut", label: "Arachide" },
  { value: "sorghum", label: "Sorgho" },
  { value: "cowpea", label: "Niébé" },
  { value: "millet", label: "Mil" },
  { value: "wheat", label: "Blé" },
];

// Résistances communes par type de culture
const commonResistances: Record<string, string[]> = {
  rice: ["Pyriculariose", "Panachure jaune", "Nématodes"],
  maize: ["Charbon", "Helminthosporiose", "Pyrale"],
  peanut: ["Rosette", "Rouille", "Cercosporiose"],
  sorghum: ["Charbon", "Anthracnose", "Moisissure des grains"],
  cowpea: ["Mosaïque", "Pucerons", "Thrips"],
  millet: ["Mildiou", "Charbon", "Ergot"],
  wheat: ["Rouille", "Septoriose", "Fusariose"],
};

const CreateVariety: React.FC = () => {
  const navigate = useNavigate();

  // État du formulaire
  const [formData, setFormData] = useState<CreateVarietyData>({
    code: "",
    name: "",
    cropType: "",
    description: "",
    maturityDays: 0,
    yieldPotential: 0,
    resistances: [],
    origin: "",
    releaseYear: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateVarietyData, string>>
  >({});
  const [availableResistances, setAvailableResistances] = useState<string[]>(
    []
  );
  const [newResistance, setNewResistance] = useState("");

  // Mutation pour créer la variété
  const createVarietyMutation = useApiMutation<any, CreateVarietyData>(
    "/varieties",
    "post",
    {
      onSuccess: (data) => {
        toast.success("Variété créée avec succès !");
        navigate(`/dashboard/varieties/${data.id}`);
      },
      onError: (error) => {
        toast.error(`Erreur lors de la création : ${error.message}`);
      },
      invalidateQueries: [["varieties"]],
    }
  );

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateVarietyData, string>> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis";
    } else if (formData.code.length < 2) {
      newErrors.code = "Le code doit contenir au moins 2 caractères";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (formData.name.length < 3) {
      newErrors.name = "Le nom doit contenir au moins 3 caractères";
    }

    if (!formData.cropType) {
      newErrors.cropType = "Le type de culture est requis";
    }

    if (!formData.maturityDays || formData.maturityDays <= 0) {
      newErrors.maturityDays =
        "Le nombre de jours de maturité doit être positif";
    }

    if (formData.yieldPotential !== undefined && formData.yieldPotential < 0) {
      newErrors.yieldPotential =
        "Le rendement potentiel ne peut pas être négatif";
    }

    if (
      formData.releaseYear &&
      (formData.releaseYear < 1900 ||
        formData.releaseYear > new Date().getFullYear())
    ) {
      newErrors.releaseYear = "L'année de sortie n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestionnaires d'événements
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "maturityDays" ||
        name === "yieldPotential" ||
        name === "releaseYear"
          ? value
            ? Number(value)
            : 0
          : value,
    }));

    // Effacer l'erreur lors de la saisie
    if (errors[name as keyof CreateVarietyData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCropTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cropType = e.target.value;
    setFormData((prev) => ({ ...prev, cropType }));
    setAvailableResistances(commonResistances[cropType] || []);

    // Effacer l'erreur
    if (errors.cropType) {
      setErrors((prev) => ({ ...prev, cropType: undefined }));
    }
  };

  const handleResistanceToggle = (resistance: string) => {
    setFormData((prev) => ({
      ...prev,
      resistances: prev.resistances.includes(resistance)
        ? prev.resistances.filter((r) => r !== resistance)
        : [...prev.resistances, resistance],
    }));
  };

  const handleAddCustomResistance = () => {
    if (
      newResistance.trim() &&
      !formData.resistances.includes(newResistance.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        resistances: [...prev.resistances, newResistance.trim()],
      }));
      setNewResistance("");
    }
  };

  const handleRemoveResistance = (resistance: string) => {
    setFormData((prev) => ({
      ...prev,
      resistances: prev.resistances.filter((r) => r !== resistance),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    // Nettoyer les données avant envoi
    const cleanData = {
      ...formData,
      description: formData.description?.trim() || undefined,
      origin: formData.origin?.trim() || undefined,
      yieldPotential: formData.yieldPotential || undefined,
      releaseYear: formData.releaseYear || undefined,
    };

    createVarietyMutation.mutate(cleanData);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/varieties")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Créer une nouvelle variété</h1>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code */}
              <div className="space-y-2">
                <label
                  htmlFor="code"
                  className="text-sm font-medium text-gray-700"
                >
                  Code de la variété *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: NERICA-L19"
                />
                {errors.code && (
                  <p className="text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Nom de la variété *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: NERICA 19"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Type de culture */}
            <div className="space-y-2">
              <label
                htmlFor="cropType"
                className="text-sm font-medium text-gray-700"
              >
                Type de culture *
              </label>
              <select
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleCropTypeChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.cropType ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Sélectionner un type de culture</option>
                {cropTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.cropType && (
                <p className="text-sm text-red-600">{errors.cropType}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description de la variété..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Caractéristiques agronomiques */}
        <Card>
          <CardHeader>
            <CardTitle>Caractéristiques agronomiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Jours de maturité */}
              <div className="space-y-2">
                <label
                  htmlFor="maturityDays"
                  className="text-sm font-medium text-gray-700"
                >
                  Durée de maturité (jours) *
                </label>
                <input
                  type="number"
                  id="maturityDays"
                  name="maturityDays"
                  value={formData.maturityDays || ""}
                  onChange={handleInputChange}
                  min="1"
                  max="365"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.maturityDays ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="90"
                />
                {errors.maturityDays && (
                  <p className="text-sm text-red-600">{errors.maturityDays}</p>
                )}
              </div>

              {/* Rendement potentiel */}
              <div className="space-y-2">
                <label
                  htmlFor="yieldPotential"
                  className="text-sm font-medium text-gray-700"
                >
                  Rendement potentiel (T/ha)
                </label>
                <input
                  type="number"
                  id="yieldPotential"
                  name="yieldPotential"
                  value={formData.yieldPotential || ""}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.yieldPotential ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="5.5"
                />
                {errors.yieldPotential && (
                  <p className="text-sm text-red-600">
                    {errors.yieldPotential}
                  </p>
                )}
              </div>

              {/* Année de sortie */}
              <div className="space-y-2">
                <label
                  htmlFor="releaseYear"
                  className="text-sm font-medium text-gray-700"
                >
                  Année de sortie
                </label>
                <input
                  type="number"
                  id="releaseYear"
                  name="releaseYear"
                  value={formData.releaseYear || ""}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.releaseYear ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={new Date().getFullYear().toString()}
                />
                {errors.releaseYear && (
                  <p className="text-sm text-red-600">{errors.releaseYear}</p>
                )}
              </div>
            </div>

            {/* Origine */}
            <div className="space-y-2">
              <label
                htmlFor="origin"
                className="text-sm font-medium text-gray-700"
              >
                Origine/Centre de développement
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: ISRA Saint-Louis, ADRAO"
              />
            </div>
          </CardContent>
        </Card>

        {/* Résistances */}
        <Card>
          <CardHeader>
            <CardTitle>Résistances aux maladies et ravageurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résistances communes selon le type de culture */}
            {availableResistances.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Résistances communes pour{" "}
                  {cropTypes.find((t) => t.value === formData.cropType)?.label}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableResistances.map((resistance) => (
                    <button
                      key={resistance}
                      type="button"
                      onClick={() => handleResistanceToggle(resistance)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        formData.resistances.includes(resistance)
                          ? "bg-green-100 border-green-500 text-green-800"
                          : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {resistance}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ajouter une résistance personnalisée */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Ajouter une résistance personnalisée:
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newResistance}
                  onChange={(e) => setNewResistance(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomResistance())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nom de la résistance..."
                />
                <Button
                  type="button"
                  onClick={handleAddCustomResistance}
                  variant="outline"
                  disabled={!newResistance.trim()}
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Liste des résistances sélectionnées */}
            {formData.resistances.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Résistances sélectionnées:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.resistances.map((resistance) => (
                    <span
                      key={resistance}
                      className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
                    >
                      {resistance}
                      <button
                        type="button"
                        onClick={() => handleRemoveResistance(resistance)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/varieties")}
            disabled={createVarietyMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createVarietyMutation.isPending}
            className="flex items-center gap-2"
          >
            {createVarietyMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {createVarietyMutation.isPending
              ? "Création..."
              : "Créer la variété"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateVariety;
