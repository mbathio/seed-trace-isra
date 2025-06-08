// frontend/src/App.tsx - CORRECTION DU ROUTAGE
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
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* ✅ CORRECTION: Route Dashboard */}
                <Route index element={<Dashboard />} />

                {/* Seed Lots */}
                <Route path="seeds">
                  <Route index element={<SeedLots />} />
                  <Route path="create" element={<CreateSeedLot />} />
                  <Route path=":id" element={<SeedLotDetail />} />
                </Route>

                {/* Varieties */}
                <Route path="varieties">
                  <Route index element={<Varieties />} />
                  <Route path="create" element={<CreateVariety />} />
                  <Route path=":id" element={<VarietyDetail />} />
                </Route>

                {/* Multipliers */}
                <Route path="multipliers">
                  <Route index element={<Multipliers />} />
                </Route>

                {/* Quality Controls */}
                <Route path="quality">
                  <Route index element={<QualityControls />} />
                  <Route path="create" element={<CreateQualityControl />} />
                </Route>

                {/* Productions */}
                <Route path="productions">
                  <Route index element={<Productions />} />
                </Route>

                {/* Reports */}
                <Route path="reports">
                  <Route index element={<Reports />} />
                </Route>

                {/* Users */}
                <Route path="users">
                  <Route index element={<Users />} />
                </Route>
              </Route>

              {/* ✅ CORRECTION: Redirection vers la racine */}
              <Route
                path="/login"
                element={<Navigate to="/auth/login" replace />}
              />
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
