// frontend/src/components/auth/ProtectedRoute.tsx

import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../../layouts/LoadingSpinner";
import { Button } from "../ui/button";
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner
          size="lg"
          message="Vérification de l'authentification..."
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion en sauvegardant la destination
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle si nécessaire
  if (requiredRole && user) {
    const userRole = user.role.toUpperCase();
    const requiredRoleUpper = requiredRole.toUpperCase();

    // Hiérarchie des rôles
    const roleHierarchy = {
      ADMIN: 7,
      MANAGER: 6,
      RESEARCHER: 5,
      TECHNICIAN: 4,
      INSPECTOR: 3,
      MULTIPLIER: 2,
      GUEST: 1,
    };

    const userLevel =
      roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel =
      roleHierarchy[requiredRoleUpper as keyof typeof roleHierarchy] || 0;

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Accès refusé
            </h2>
            <p className="text-gray-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
