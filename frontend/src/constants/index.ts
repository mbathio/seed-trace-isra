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

// ✅ CORRECTION: Utiliser les mêmes valeurs que dans la DB (MAJUSCULES + underscore)
export const LOT_STATUSES = [
  { value: "PENDING", label: "En attente" },
  { value: "CERTIFIED", label: "Certifié" },
  { value: "REJECTED", label: "Rejeté" },
  { value: "IN_STOCK", label: "En stock" },
  { value: "ACTIVE", label: "Actif" },
  { value: "DISTRIBUTED", label: "Distribué" },
  { value: "SOLD", label: "Vendu" },
];

// ✅ CORRECTION: Utiliser les mêmes valeurs que dans la DB (MAJUSCULES)
export const USER_ROLES = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "MANAGER", label: "Manager" },
  { value: "RESEARCHER", label: "Chercheur" },
  { value: "TECHNICIAN", label: "Technicien" },
  { value: "INSPECTOR", label: "Inspecteur" },
  { value: "MULTIPLIER", label: "Multiplicateur" },
  { value: "GUEST", label: "Invité" },
];

// ✅ CORRECTION: Utiliser les mêmes valeurs que dans la DB (MAJUSCULES)
export const QUALITY_TEST_RESULTS = [
  { value: "PASS", label: "Réussi" },
  { value: "FAIL", label: "Échec" },
];

// ✅ CORRECTION: Utiliser les mêmes valeurs que dans la DB (MAJUSCULES + underscore)
export const PRODUCTION_STATUSES = [
  { value: "PLANNED", label: "Planifiée" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminée" },
  { value: "CANCELLED", label: "Annulée" },
];

export const MULTIPLIER_STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "INACTIVE", label: "Inactif" },
];

export const CERTIFICATION_LEVELS = [
  { value: "BEGINNER", label: "Débutant" },
  { value: "INTERMEDIATE", label: "Intermédiaire" },
  { value: "EXPERT", label: "Expert" },
];

export const PARCEL_STATUSES = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "IN_USE", label: "En cours d'utilisation" },
  { value: "RESTING", label: "En repos" },
];

export const CONTRACT_STATUSES = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "ACTIVE", label: "Actif" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
];
