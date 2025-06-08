// frontend/src/App.tsx - CORRECTION COMPLÈTE DES ROUTES
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

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
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
              {/* ✅ CORRECTION: Route de redirection par défaut */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              {/* ✅ CORRECTION: Routes d'authentification */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<Navigate to="/auth/login" replace />} />
                <Route path="login" element={<Login />} />
              </Route>

              {/* ✅ CORRECTION: Route de connexion directe */}
              <Route
                path="/login"
                element={<Navigate to="/auth/login" replace />}
              />

              {/* ✅ CORRECTION: Routes protégées du dashboard */}
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

              {/* ✅ CORRECTION: Routes de semences */}
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

              {/* ✅ CORRECTION: Routes de variétés */}
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

              {/* ✅ CORRECTION: Routes de multiplicateurs */}
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

              {/* ✅ CORRECTION: Routes de contrôle qualité */}
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

              {/* ✅ CORRECTION: Routes de productions */}
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

              {/* ✅ CORRECTION: Routes de rapports */}
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

              {/* ✅ CORRECTION: Routes d'administration */}
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

              {/* ✅ CORRECTION: Route 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
