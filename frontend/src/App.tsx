// frontend/src/App.tsx - ROUTAGE CORRIGÉ AVEC NOUVELLES PAGES
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/auth/Login";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import SeedLots from "./pages/seeds/SeedLots";
import SeedLotDetail from "./pages/seeds/SeedLotDetail";
import CreateSeedLot from "./pages/seeds/CreateSeedLot";
import Varieties from "./pages/varieties/Varieties";
import CreateVariety from "./pages/varieties/CreateVariety";
import VarietyDetail from "./pages/varieties/VarietyDetail";
import Multipliers from "./pages/multipliers/Multipliers";
import QualityControls from "./pages/quality/QualityControls";
import CreateQualityControl from "./pages/quality/CreateQualityControl";
import Productions from "./pages/productions/Productions";
import Reports from "./pages/reports/Reports";
import Users from "./pages/users/Users";

// Nouvelles pages
import Parcels from "./pages/parcels/Parcels";
import Genealogy from "./pages/genealogy/Genealogy";

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* ✅ LANDING PAGE - Page d'accueil publique */}
              <Route path="/" element={<LandingPage />} />

              {/* ✅ ROUTES D'AUTHENTIFICATION */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<Navigate to="/auth/login" replace />} />
                <Route path="login" element={<Login />} />
              </Route>

              {/* ✅ ROUTE DE CONNEXION DIRECTE */}
              <Route
                path="/login"
                element={<Navigate to="/auth/login" replace />}
              />

              {/* ✅ ROUTES PROTÉGÉES DU DASHBOARD */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
              </Route>

              {/* ✅ ROUTES DE SEMENCES */}
              <Route
                path="/seeds"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SeedLots />} />
                <Route path="create" element={<CreateSeedLot />} />
                <Route path=":id" element={<SeedLotDetail />} />
              </Route>

              {/* ✅ ROUTES DE VARIÉTÉS */}
              <Route
                path="/varieties"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Varieties />} />
                <Route path="create" element={<CreateVariety />} />
                <Route path=":id" element={<VarietyDetail />} />
              </Route>

              {/* ✅ ROUTES DE MULTIPLICATEURS */}
              <Route
                path="/multipliers"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Multipliers />} />
              </Route>

              {/* ✅ ROUTES DE PARCELLES */}
              <Route
                path="/parcels"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Parcels />} />
              </Route>

              {/* ✅ ROUTES DE GÉNÉALOGIE */}
              <Route
                path="/genealogy"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Genealogy />} />
              </Route>

              {/* ✅ ROUTES DE CONTRÔLE QUALITÉ */}
              <Route
                path="/quality"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<QualityControls />} />
                <Route path="create" element={<CreateQualityControl />} />
              </Route>

              {/* ✅ ROUTES DE PRODUCTIONS */}
              <Route
                path="/productions"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Productions />} />
              </Route>

              {/* ✅ ROUTES DE RAPPORTS */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Reports />} />
              </Route>

              {/* ✅ ROUTES D'ADMINISTRATION */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Users />} />
              </Route>

              {/* ✅ ROUTE 404 - Redirection vers la landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

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
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
