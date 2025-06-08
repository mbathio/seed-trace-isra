export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status) {
    const statusMessages: Record<number, string> = {
      400: "Requête invalide",
      401: "Non autorisé",
      403: "Accès refusé",
      404: "Ressource non trouvée",
      409: "Conflit - La ressource existe déjà",
      422: "Données de validation incorrectes",
      500: "Erreur interne du serveur",
    };

    return statusMessages[error.response.status] || "Erreur serveur";
  }

  if (error.message) {
    return error.message;
  }

  return "Une erreur inattendue s'est produite";
};
