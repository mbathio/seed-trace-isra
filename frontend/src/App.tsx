// frontend/src/App.tsx - Configuration des routes
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";

// Seed Lots Pages
import SeedLots from "./pages/seeds/SeedLots";
import CreateSeedLot from "./pages/seeds/CreateSeedLot";
import SeedLotDetail from "./pages/seeds/SeedLotDetail";
import EditSeedLot from "./pages/seeds/EditSeedLot";
import TransferSeedLot from "./pages/seeds/TransferSeedLot";

// Varieties Pages
import Varieties from "./pages/varieties/Varieties";
import CreateVariety from "./pages/varieties/CreateVariety";
import VarietyDetail from "./pages/varieties/VarietyDetail";

// Multipliers Pages
import Multipliers from "./pages/multipliers/Multipliers";
import CreateMultiplier from "./pages/multipliers/CreateMultiplier";
import MultiplierDetail from "./pages/multipliers/MultiplierDetail";

// Parcels Pages
import Parcels from "./pages/parcels/Parcels";
import CreateParcel from "./pages/parcels/CreateParcel";
import ParcelDetail from "./pages/parcels/ParcelDetail";
import EditParcel from "./pages/parcels/EditParcel";

// Productions Pages
import Productions from "./pages/productions/Productions";
import CreateProduction from "./pages/productions/CreateProduction";
import ProductionDetail from "./pages/productions/ProductionDetail";

// Quality Controls Pages
import QualityControls from "./pages/quality/QualityControls";
import CreateQualityControl from "./pages/quality/CreateQualityControl";
import QualityControlDetail from "./pages/quality/QualityControlDetail";

// Other Pages
import Genealogy from "./pages/genealogy/Genealogy";
import Users from "./pages/users/Users";
import Reports from "./pages/reports/Reports";

// Trace Page (nouvelle page pour affichage après scan du QR Code)
import TracePage from "./pages/trace/TracePage"; // ✅ nouveau composant
import ScanPage from "./pages/Scan"; // ✅ nouvel import

// Protected Route Component
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page - Accessible à tous */}
            <Route path="/" element={<LandingPage />} />

            {/* ✅ Route publique pour affichage des informations d’un lot après scan du QR code */}
            <Route path="/trace/:id" element={<TracePage />} />
            <Route path="/scan" element={<ScanPage />} />

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard Home */}
              <Route index element={<Dashboard />} />

              {/* Seed Lots Routes */}
              <Route path="seed-lots">
                <Route index element={<SeedLots />} />
                <Route path="create" element={<CreateSeedLot />} />
                <Route path=":id" element={<SeedLotDetail />} />
                <Route path=":id/edit" element={<EditSeedLot />} />
                <Route path=":id/transfer" element={<TransferSeedLot />} />
              </Route>

              {/* Varieties Routes */}
              <Route path="varieties">
                <Route index element={<Varieties />} />
                <Route path="create" element={<CreateVariety />} />
                <Route path=":id" element={<VarietyDetail />} />
              </Route>

              {/* Multipliers Routes */}
              <Route path="multipliers">
                <Route index element={<Multipliers />} />
                <Route path="create" element={<CreateMultiplier />} />
                <Route path=":id" element={<MultiplierDetail />} />
              </Route>

              {/* Parcels Routes */}
              <Route path="parcels">
                <Route index element={<Parcels />} />
                <Route path="create" element={<CreateParcel />} />
                <Route path=":id" element={<ParcelDetail />} />
                <Route path=":id/edit" element={<EditParcel />} />
              </Route>

              {/* Productions Routes */}
              <Route path="productions">
                <Route index element={<Productions />} />
                <Route path="create" element={<CreateProduction />} />
                <Route path=":id" element={<ProductionDetail />} />
              </Route>

              {/* Quality Controls Routes */}
              <Route path="quality-controls">
                <Route index element={<QualityControls />} />
                <Route path="create" element={<CreateQualityControl />} />
                <Route path=":id" element={<QualityControlDetail />} />
              </Route>

              {/* Other Routes */}
              <Route path="genealogy" element={<Genealogy />} />
              <Route path="users" element={<Users />} />
              <Route path="reports" element={<Reports />} />

              {/* 404 within dashboard - Redirect to dashboard home */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch all - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
