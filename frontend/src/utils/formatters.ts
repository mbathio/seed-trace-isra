export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatShortDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR");
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fr-FR").format(num);
};

export const formatCurrency = (amount: number, currency = "XOF"): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};
