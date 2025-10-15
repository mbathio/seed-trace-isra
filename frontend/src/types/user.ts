// frontend/src/types/user.ts

export type UserRole = 
  | "admin" 
  | "manager" 
  | "inspector" 
  | "multiplier" 
  | "guest" 
  | "technician" 
  | "researcher";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    qualityControls: number;
    reports: number;
    activities: number;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  avatar?: string;
  isActive?: boolean;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

// Libellés des rôles pour l'affichage
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  manager: "Gestionnaire",
  inspector: "Inspecteur",
  multiplier: "Multiplicateur",
  guest: "Invité",
  technician: "Technicien",
  researcher: "Chercheur",
};

// Couleurs des badges pour chaque rôle
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  inspector: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  multiplier: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  guest: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  technician: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  researcher: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};