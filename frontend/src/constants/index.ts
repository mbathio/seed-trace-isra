export const SEED_LEVELS = [
  { value: "GO", label: "GO - Génération origine" },
  { value: "G1", label: "G1 - Première génération" },
  { value: "G2", label: "G2 - Deuxième génération" },
  { value: "G3", label: "G3 - Troisième génération" },
  { value: "G4", label: "G4 - Quatrième génération" },
  { value: "R1", label: "R1 - Première reproduction" },
  { value: "R2", label: "R2 - Deuxième reproduction" },
];

export const CROP_TYPES = [
  { value: "RICE", label: "Riz" },
  { value: "MAIZE", label: "Maïs" },
  { value: "PEANUT", label: "Arachide" },
  { value: "SORGHUM", label: "Sorgho" },
  { value: "COWPEA", label: "Niébé" },
  { value: "MILLET", label: "Mil" },
];

export const LOT_STATUSES = [
  { value: "pending", label: "En attente" },
  { value: "certified", label: "Certifié" },
  { value: "rejected", label: "Rejeté" },
  { value: "in-stock", label: "En stock" },
  { value: "active", label: "Actif" },
  { value: "distributed", label: "Distribué" },
];

export const USER_ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "manager", label: "Manager" },
  { value: "researcher", label: "Chercheur" },
  { value: "technician", label: "Technicien" },
  { value: "inspector", label: "Inspecteur" },
  { value: "multiplier", label: "Multiplicateur" },
  { value: "guest", label: "Invité" },
];

export const QUALITY_TEST_RESULTS = [
  { value: "pass", label: "Réussi" },
  { value: "fail", label: "Échec" },
];

export const PRODUCTION_STATUSES = [
  { value: "planned", label: "Planifiée" },
  { value: "in-progress", label: "En cours" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
];
