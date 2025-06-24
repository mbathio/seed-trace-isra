// frontend/src/utils/transformers.ts - VERSION SIMPLIFIÉE
// Ce fichier n'est plus nécessaire car les transformations sont gérées côté backend
// Gardez-le uniquement pour des transformations spécifiques au frontend si nécessaire

export class DataTransformer {
  // Garder uniquement les méthodes utiles pour l'affichage
  static formatDateForDisplay(date: string | Date | null | undefined): string {
    if (!date) return "-";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "-";

      return dateObj.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  }

  static formatDateForInput(date: string | Date | null | undefined): string {
    if (!date) return "";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "";

      // Format YYYY-MM-DD pour les inputs HTML
      return dateObj.toISOString().split("T")[0];
    } catch {
      return "";
    }
  }
}

export default DataTransformer;
