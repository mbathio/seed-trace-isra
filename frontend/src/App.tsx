// frontend/src/App.tsx - ✅ ROUTER PRINCIPAL CORRIGÉ avec routes standardisées
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
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";

// Pages principales
import DashboardPage from "./pages/Dashboard";
import SeedLotsPage from "./pages/seeds/SeedLots";
import SeedLotDetailsPage from "./pages/seeds/SeedLotDetail";
import CreateSeedLotPage from "./pages/seeds/CreateSeedLot";
import VarietiesPage from "./pages/varieties/Varieties";
import VarietyDetailsPage from "./pages/varieties/VarietyDetail";
import CreateVarietyPage from "./pages/varieties/CreateVariety";
import MultipliersPage from "./pages/multipliers/Multipliers";
import MultiplierDetailsPage from "./pages/multipliers/MultiplierDetail";
import CreateMultiplierPage from "./pages/multipliers/CreateMultiplier";
import QualityControlsPage from "./pages/quality/QualityControls";
import QualityControlDetailsPage from "./pages/quality/QualityControlDetail";
import CreateQualityControlPage from "./pages/quality/CreateQualityControl";
import ProductionsPage from "./pages/productions/Productions";
import ProductionDetailsPage from "./pages/productions/ProductionDetail";
import CreateProductionPage from "./pages/productions/CreateProduction";
import ParcelsPage from "./pages/parcels/Parcels";
import ParcelDetailsPage from "./pages/parcels/ParcelDetail";
import CreateParcelPage from "./pages/parcels/CreateParcel";
import ReportsPage from "./pages/reports/Reports";
import UsersPage from "./pages/users/Users";
import LandingPage from "./pages/LandingPage";
import GenealogyPage from "./pages/genealogy/Genealogy";

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // ✅ CORRIGÉ: gcTime au lieu de cacheTime
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

              {/* ✅ CORRECTION: Routes des semences standardisées */}
              <Route path="seed-lots" element={<SeedLotsPage />} />
              <Route path="seed-lots/create" element={<CreateSeedLotPage />} />
              <Route path="seed-lots/:id" element={<SeedLotDetailsPage />} />

              {/* ✅ Variétés - déjà standardisé */}
              <Route path="varieties" element={<VarietiesPage />} />
              <Route path="varieties/create" element={<CreateVarietyPage />} />
              <Route path="varieties/:id" element={<VarietyDetailsPage />} />

              {/* ✅ Généalogie - déjà standardisé */}
              <Route path="genealogy" element={<GenealogyPage />} />
              <Route path="genealogy/:lotId" element={<GenealogyPage />} />

              {/* ✅ Multiplicateurs - déjà standardisé */}
              <Route path="multipliers" element={<MultipliersPage />} />
              <Route
                path="multipliers/create"
                element={<CreateMultiplierPage />}
              />
              <Route
                path="multipliers/:id"
                element={<MultiplierDetailsPage />}
              />

              {/* ✅ Parcelles - déjà standardisé */}
              <Route path="parcels" element={<ParcelsPage />} />
              <Route path="parcels/create" element={<CreateParcelPage />} />
              <Route path="parcels/:id" element={<ParcelDetailsPage />} />

              {/* ✅ Productions - déjà standardisé */}
              <Route path="productions" element={<ProductionsPage />} />
              <Route
                path="productions/create"
                element={<CreateProductionPage />}
              />
              <Route
                path="productions/:id"
                element={<ProductionDetailsPage />}
              />

              {/* ✅ CORRECTION: Routes contrôles qualité standardisées */}
              <Route
                path="quality-controls"
                element={<QualityControlsPage />}
              />
              <Route
                path="quality-controls/create"
                element={<CreateQualityControlPage />}
              />
              <Route
                path="quality-controls/:id"
                element={<QualityControlDetailsPage />}
              />

              {/* ✅ Rapports - déjà standardisé */}
              <Route path="reports" element={<ReportsPage />} />

              {/* ✅ Administration - déjà standardisé */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* ✅ CORRECTION: Redirections pour compatibilité avec anciennes routes */}
            <Route
              path="/seeds"
              element={<Navigate to="/dashboard/seed-lots" replace />}
            />
            <Route
              path="/seeds/*"
              element={<Navigate to="/dashboard/seed-lots" replace />}
            />
            <Route
              path="/quality"
              element={<Navigate to="/dashboard/quality-controls" replace />}
            />
            <Route
              path="/quality/*"
              element={<Navigate to="/dashboard/quality-controls" replace />}
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
