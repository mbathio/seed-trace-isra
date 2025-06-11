// frontend/src/App.tsx - ROUTER PRINCIPAL CORRIGÉ
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages d'authentification
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Pages principales
import DashboardPage from "./pages/DashboardPage";
import SeedLotsPage from "./pages/seeds/SeedLotsPage";
import SeedLotDetailsPage from "./pages/seeds/SeedLotDetailsPage";
import CreateSeedLotPage from "./pages/seeds/CreateSeedLotPage";
import VarietiesPage from "./pages/varieties/VarietiesPage";
import VarietyDetailsPage from "./pages/varieties/VarietyDetailsPage";
import CreateVarietyPage from "./pages/varieties/CreateVarietyPage";
import MultipliersPage from "./pages/multipliers/MultipliersPage";
import MultiplierDetailsPage from "./pages/multipliers/MultiplierDetailsPage";
import CreateMultiplierPage from "./pages/multipliers/CreateMultiplierPage";
import QualityControlsPage from "./pages/quality/QualityControlsPage";
import QualityControlDetailsPage from "./pages/quality/QualityControlDetailsPage";
import CreateQualityControlPage from "./pages/quality/CreateQualityControlPage";
import ProductionsPage from "./pages/productions/ProductionsPage";
import ProductionDetailsPage from "./pages/productions/ProductionDetailsPage";
import CreateProductionPage from "./pages/productions/CreateProductionPage";
import ParcelsPage from "./pages/parcels/ParcelsPage";
import ParcelDetailsPage from "./pages/parcels/ParcelDetailsPage";
import CreateParcelPage from "./pages/parcels/CreateParcelPage";
import ReportsPage from "./pages/reports/ReportsPage";
import UsersPage from "./pages/users/UsersPage";
import SettingsPage from "./pages/settings/SettingsPage";
import LandingPage from "./pages/LandingPage";
import GenealogyPage from "./pages/genealogy/GenealogyPage";

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Page d'accueil publique */}
            <Route path="/" element={<LandingPage />} />

            {/* Routes d'authentification */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Routes protégées avec layout dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard principal */}
              <Route index element={<DashboardPage />} />

              {/* Gestion des semences */}
              <Route path="seeds" element={<SeedLotsPage />} />
              <Route path="seeds/create" element={<CreateSeedLotPage />} />
              <Route path="seeds/:id" element={<SeedLotDetailsPage />} />

              {/* Variétés */}
              <Route path="varieties" element={<VarietiesPage />} />
              <Route path="varieties/create" element={<CreateVarietyPage />} />
              <Route path="varieties/:id" element={<VarietyDetailsPage />} />

              {/* Généalogie */}
              <Route path="genealogy" element={<GenealogyPage />} />
              <Route path="genealogy/:lotId" element={<GenealogyPage />} />

              {/* Multiplicateurs */}
              <Route path="multipliers" element={<MultipliersPage />} />
              <Route
                path="multipliers/create"
                element={<CreateMultiplierPage />}
              />
              <Route
                path="multipliers/:id"
                element={<MultiplierDetailsPage />}
              />

              {/* Parcelles */}
              <Route path="parcels" element={<ParcelsPage />} />
              <Route path="parcels/create" element={<CreateParcelPage />} />
              <Route path="parcels/:id" element={<ParcelDetailsPage />} />

              {/* Productions */}
              <Route path="productions" element={<ProductionsPage />} />
              <Route
                path="productions/create"
                element={<CreateProductionPage />}
              />
              <Route
                path="productions/:id"
                element={<ProductionDetailsPage />}
              />

              {/* Contrôles qualité */}
              <Route path="quality" element={<QualityControlsPage />} />
              <Route
                path="quality/create"
                element={<CreateQualityControlPage />}
              />
              <Route
                path="quality/:id"
                element={<QualityControlDetailsPage />}
              />

              {/* Rapports */}
              <Route path="reports" element={<ReportsPage />} />

              {/* Administration */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Routes directes pour compatibilité avec la sidebar */}
            <Route
              path="/seeds"
              element={<Navigate to="/dashboard/seeds" replace />}
            />
            <Route
              path="/varieties"
              element={<Navigate to="/dashboard/varieties" replace />}
            />
            <Route
              path="/multipliers"
              element={<Navigate to="/dashboard/multipliers" replace />}
            />
            <Route
              path="/parcels"
              element={<Navigate to="/dashboard/parcels" replace />}
            />
            <Route
              path="/productions"
              element={<Navigate to="/dashboard/productions" replace />}
            />
            <Route
              path="/quality"
              element={<Navigate to="/dashboard/quality" replace />}
            />
            <Route
              path="/genealogy"
              element={<Navigate to="/dashboard/genealogy" replace />}
            />
            <Route
              path="/reports"
              element={<Navigate to="/dashboard/reports" replace />}
            />
            <Route
              path="/users"
              element={<Navigate to="/dashboard/users" replace />}
            />
            <Route
              path="/settings"
              element={<Navigate to="/dashboard/settings" replace />}
            />

            {/* Route de fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
