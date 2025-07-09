// frontend/src/App.tsx
import {
  createBrowserRouter,
  RouterProvider,
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
import LandingPage from "./pages/LandingPage";

// Routes des semences
import SeedLotsPage from "./pages/seeds/SeedLots";
import SeedLotDetailsPage from "./pages/seeds/SeedLotDetail";
import CreateSeedLotPage from "./pages/seeds/CreateSeedLot";
import EditSeedLot from "./pages/seeds/EditSeedLot";
import TransferSeedLot from "./pages/seeds/TransferSeedLot";

// Routes des variétés
import VarietiesPage from "./pages/varieties/Varieties";
import VarietyDetailsPage from "./pages/varieties/VarietyDetail";
import CreateVarietyPage from "./pages/varieties/CreateVariety";

// Routes des multiplicateurs
import MultipliersPage from "./pages/multipliers/Multipliers";
import MultiplierDetailsPage from "./pages/multipliers/MultiplierDetail";
import CreateMultiplierPage from "./pages/multipliers/CreateMultiplier";

// Routes des contrôles qualité
import QualityControlsPage from "./pages/quality/QualityControls";
import QualityControlDetailsPage from "./pages/quality/QualityControlDetail";
import CreateQualityControlPage from "./pages/quality/CreateQualityControl";

// Routes des productions
import ProductionsPage from "./pages/productions/Productions";
import ProductionDetailsPage from "./pages/productions/ProductionDetail";
import CreateProductionPage from "./pages/productions/CreateProduction";

// Routes des parcelles
import ParcelsPage from "./pages/parcels/Parcels";
import ParcelDetailsPage from "./pages/parcels/ParcelDetail";
import CreateParcelPage from "./pages/parcels/CreateParcel";
import EditParcel from "./pages/parcels/EditParcel";

// Autres pages
import GenealogyPage from "./pages/genealogy/Genealogy";
import ReportsPage from "./pages/reports/Reports";
import UsersPage from "./pages/users/Users";

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Définition du router avec les future flags
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "register",
          element: <RegisterPage />,
        },
      ],
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        // Routes des semences
        {
          path: "seed-lots",
          children: [
            {
              index: true,
              element: <SeedLotsPage />,
            },
            {
              path: "new",
              element: <CreateSeedLotPage />,
            },
            {
              path: "create",
              element: <Navigate to="/dashboard/seed-lots/new" replace />,
            },
            {
              path: ":id",
              element: <SeedLotDetailsPage />,
            },
            {
              path: ":id/edit",
              element: <EditSeedLot />,
            },
            {
              path: ":id/transfer",
              element: <TransferSeedLot />,
            },
          ],
        },
        // Routes des variétés
        {
          path: "varieties",
          children: [
            {
              index: true,
              element: <VarietiesPage />,
            },
            {
              path: "new",
              element: <CreateVarietyPage />,
            },
            {
              path: ":id",
              element: <VarietyDetailsPage />,
            },
          ],
        },
        // Routes des multiplicateurs
        {
          path: "multipliers",
          children: [
            {
              index: true,
              element: <MultipliersPage />,
            },
            {
              path: "new",
              element: <CreateMultiplierPage />,
            },
            {
              path: ":id",
              element: <MultiplierDetailsPage />,
            },
          ],
        },
        // Routes des contrôles qualité
        {
          path: "quality-controls",
          children: [
            {
              index: true,
              element: <QualityControlsPage />,
            },
            {
              path: "new",
              element: <CreateQualityControlPage />,
            },
            {
              path: ":id",
              element: <QualityControlDetailsPage />,
            },
          ],
        },
        // Routes des productions
        {
          path: "productions",
          children: [
            {
              index: true,
              element: <ProductionsPage />,
            },
            {
              path: "new",
              element: <CreateProductionPage />,
            },
            {
              path: ":id",
              element: <ProductionDetailsPage />,
            },
          ],
        },
        // Routes des parcelles
        {
          path: "parcels",
          children: [
            {
              index: true,
              element: <ParcelsPage />,
            },
            {
              path: "new",
              element: <CreateParcelPage />,
            },
            {
              path: ":id",
              element: <ParcelDetailsPage />,
            },
            {
              path: ":id/edit",
              element: <EditParcel />,
            },
          ],
        },
        // Routes de généalogie
        {
          path: "genealogy",
          children: [
            {
              index: true,
              element: <GenealogyPage />,
            },
            {
              path: ":lotId",
              element: <GenealogyPage />,
            },
          ],
        },
        // Routes des rapports
        {
          path: "reports",
          element: <ReportsPage />,
        },
        // Routes d'administration
        {
          path: "users",
          element: (
            <ProtectedRoute requiredRole="ADMIN">
              <UsersPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    // Redirections pour compatibilité avec les anciennes routes
    {
      path: "/seeds/*",
      element: <Navigate to="/dashboard/seed-lots" replace />,
    },
    {
      path: "/varieties/*",
      element: <Navigate to="/dashboard/varieties" replace />,
    },
    {
      path: "/multipliers/*",
      element: <Navigate to="/dashboard/multipliers" replace />,
    },
    {
      path: "/quality/*",
      element: <Navigate to="/dashboard/quality-controls" replace />,
    },
    {
      path: "/parcels/*",
      element: <Navigate to="/dashboard/parcels" replace />,
    },
    {
      path: "/productions/*",
      element: <Navigate to="/dashboard/productions" replace />,
    },
    {
      path: "/genealogy/*",
      element: <Navigate to="/dashboard/genealogy" replace />,
    },
    {
      path: "/reports/*",
      element: <Navigate to="/dashboard/reports" replace />,
    },
    {
      path: "/users/*",
      element: <Navigate to="/dashboard/users" replace />,
    },
    // Route par défaut
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ],
  {
    // Activer les future flags pour éviter les avertissements
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />

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
