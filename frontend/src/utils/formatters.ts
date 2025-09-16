// frontend/src/utils/formatters.ts - VERSION CORRIGÉE AVEC GESTION DES DATES

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (
  dateInput: string | Date | null | undefined
): string => {
  if (!dateInput) return "Non spécifiée";

  try {
    let date: Date;

    if (typeof dateInput === "string") {
      // Si c'est déjà au format YYYY-MM-DD, on peut l'utiliser directement
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        date = new Date(dateInput + "T00:00:00");
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = dateInput;
    }

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn("Date invalide reçue:", dateInput);
      return "Date invalide";
    }

    // Retourner la date formatée en français
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error(
      "Erreur lors du formatage de la date:",
      error,
      "Input:",
      dateInput
    );
    return "Date invalide";
  }
};

/**
 * Formate une date pour les inputs de type date (YYYY-MM-DD)
 */
export const formatDateForInput = (
  dateInput: string | Date | null | undefined
): string => {
  if (!dateInput) return "";

  try {
    let date: Date;

    if (typeof dateInput === "string") {
      // Si c'est déjà au format YYYY-MM-DD, on le retourne tel quel
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
      }

      // Gérer les dates ISO avec timezone
      if (dateInput.includes("T")) {
        date = new Date(dateInput);
      } else {
        // Pour éviter les problèmes de timezone, ajouter l'heure locale
        date = new Date(dateInput + "T00:00:00");
      }
    } else {
      date = dateInput;
    }

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn("Date invalide pour input:", dateInput);
      return "";
    }

    // Retourner au format YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Erreur lors du formatage de la date pour input:", error);
    return "";
  }
};

/**
 * Formate une date avec l'heure
 */
export const formatDateTime = (
  dateInput: string | Date | null | undefined
): string => {
  if (!dateInput) return "Non spécifiée";

  try {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) {
      return "Date invalide";
    }

    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Erreur lors du formatage date/heure:", error);
    return "Date invalide";
  }
};

/**
 * Convertit une date au format ISO pour l'API
 */
export const formatDateForAPI = (
  dateInput: string | Date | null | undefined
): string | null => {
  if (!dateInput) return null;

  try {
    let date: Date;

    if (typeof dateInput === "string") {
      // Si c'est au format YYYY-MM-DD depuis un input date
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        date = new Date(dateInput + "T12:00:00"); // Midi pour éviter les problèmes de timezone
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = dateInput;
    }

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn("Date invalide pour API:", dateInput);
      return null;
    }

    return date.toISOString();
  } catch (error) {
    console.error("Erreur lors du formatage de la date pour API:", error);
    return null;
  }
};

/**
 * Formate un nombre avec séparateur de milliers
 */
export const formatNumber = (
  num: number | string | null | undefined
): string => {
  if (num === null || num === undefined) return "0";

  const number = typeof num === "string" ? parseFloat(num) : num;

  if (isNaN(number)) return "0";

  return new Intl.NumberFormat("fr-FR").format(number);
};

/**
 * Formate une devise
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string = "XOF"
): string => {
  if (amount === null || amount === undefined) return "0 XOF";

  const number = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(number)) return "0 XOF";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (
  value: number | string | null | undefined,
  decimals: number = 1
): string => {
  if (value === null || value === undefined) return "0%";

  const number = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(number)) return "0%";

  return `${number.toFixed(decimals)}%`;
};

/**
 * Formate une superficie en hectares
 */
export const formatArea = (
  area: number | string | null | undefined
): string => {
  if (area === null || area === undefined) return "0 ha";

  const number = typeof area === "string" ? parseFloat(area) : area;

  if (isNaN(number)) return "0 ha";

  return `${formatNumber(number)} ha`;
};

/**
 * Formate un poids en kilogrammes
 */
export const formatWeight = (
  weight: number | string | null | undefined
): string => {
  if (weight === null || weight === undefined) return "0 kg";

  const number = typeof weight === "string" ? parseFloat(weight) : weight;

  if (isNaN(number)) return "0 kg";

  return `${formatNumber(number)} kg`;
};

/**
 * Parse une date depuis un string et retourne un objet Date ou null
 */
export const parseDate = (
  dateString: string | null | undefined
): Date | null => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Vérifie si une date est dans le passé
 */
export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  if (!dateObj) return false;
  return dateObj < new Date();
};

/**
 * Vérifie si une date est dans le futur
 */
export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? parseDate(date) : date;
  if (!dateObj) return false;
  return dateObj > new Date();
};

/**
 * Calcule la différence en jours entre deux dates
 */
export const daysBetween = (
  date1: string | Date,
  date2: string | Date
): number => {
  const d1 = typeof date1 === "string" ? parseDate(date1) : date1;
  const d2 = typeof date2 === "string" ? parseDate(date2) : date2;

  if (!d1 || !d2) return 0;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Retourne la date actuelle au format YYYY-MM-DD
 */
export const getCurrentDateForInput = (): string => {
  return formatDateForInput(new Date());
};
