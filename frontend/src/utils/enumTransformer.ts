export const ENUM_MAPPINGS = {
  // Statuts de lots
  lotStatus: {
    pending: "PENDING",
    certified: "CERTIFIED",
    rejected: "REJECTED",
    "in-stock": "IN_STOCK",
    sold: "SOLD",
    active: "ACTIVE",
    distributed: "DISTRIBUTED",
  },
  // Statuts de parcelles
  parcelStatus: {
    available: "AVAILABLE",
    "in-use": "IN_USE",
    resting: "RESTING",
  },
  // Types de cultures
  cropType: {
    rice: "RICE",
    maize: "MAIZE",
    peanut: "PEANUT",
    sorghum: "SORGHUM",
    cowpea: "COWPEA",
    millet: "MILLET",
    wheat: "WHEAT",
  },
  // Ajoutez les autres mappings...
};

// Transformer pour l'envoi au backend (UI -> DB)
export function transformForBackend(data: any): any {
  // Implementation similaire à celle du backend
  return data; // À implémenter
}

// Transformer après réception du backend (DB -> UI)
export function transformFromBackend(data: any): any {
  // Implementation similaire à celle du backend
  return data; // À implémenter
}
