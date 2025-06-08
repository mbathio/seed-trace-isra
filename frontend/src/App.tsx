import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  User,
  Leaf,
  Package,
  Users,
  MapPin,
  FileText,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

// Configuration axios
const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Types TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface SeedLot {
  id: string;
  varietyId: number;
  variety: {
    id: number;
    name: string;
    code: string;
    cropType: string;
  };
  level: string;
  quantity: number;
  productionDate: string;
  expiryDate?: string;
  status: string;
  multiplier?: {
    id: number;
    name: string;
  };
  parcel?: {
    id: number;
    name: string;
    area: number;
  };
  notes?: string;
}

interface Variety {
  id: number;
  code: string;
  name: string;
  cropType: string;
  description?: string;
  maturityDays: number;
  yieldPotential?: number;
  origin?: string;
  releaseYear?: number;
}

interface QualityControl {
  id: number;
  lotId: string;
  controlDate: string;
  germinationRate: number;
  varietyPurity: number;
  moistureContent?: number;
  seedHealth?: number;
  result: string;
  observations?: string;
  inspector: {
    id: number;
    name: string;
  };
  seedLot: SeedLot;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface DashboardStats {
  overview: {
    totalSeedLots: number;
    totalProductions: number;
    activeMultipliers: number;
    totalVarieties: number;
  };
  distribution: {
    lotsByLevel: Array<{
      level: string;
      count: number;
    }>;
    topVarieties: Array<{
      variety: {
        name: string;
        code: string;
      };
      count: number;
      totalQuantity: number;
    }>;
  };
}

interface SeedLotFormData {
  varietyId: number;
  level: string;
  quantity: number;
  productionDate: string;
  notes?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Context d'authentification
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Vérifier la validité du token
      api
        .get("/auth/me")
        .then((response) => {
          setUser(response.data.data);
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user: userData, tokens } = response.data.data;

      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokens.accessToken}`;

      setUser(userData);
      toast.success("Connexion réussie !");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || "Erreur de connexion");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    toast.info("Déconnexion réussie");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Composant de protection des routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Composants d'interface utilisateur

const Button: React.FC<{
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
}> = ({ children, className = "", title }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Input: React.FC<{
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
}> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  className = "",
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
        error ? "border-red-500" : ""
      }`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Select: React.FC<{
  label?: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder,
  className = "",
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
        error ? "border-red-500" : ""
      }`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Services API
const seedLotService = {
  getAll: (params?: Record<string, unknown>) =>
    api
      .get("/seed-lots", { params })
      .then((res) => res.data as ApiResponse<SeedLot[]>),
  getById: (id: string) =>
    api.get(`/seed-lots/${id}`).then((res) => res.data as ApiResponse<SeedLot>),
  create: (data: SeedLotFormData) =>
    api
      .post("/seed-lots", data)
      .then((res) => res.data as ApiResponse<SeedLot>),
  update: (id: string, data: Partial<SeedLotFormData>) =>
    api
      .put(`/seed-lots/${id}`, data)
      .then((res) => res.data as ApiResponse<SeedLot>),
  delete: (id: string) =>
    api.delete(`/seed-lots/${id}`).then((res) => res.data as ApiResponse<void>),
  getGenealogy: (id: string) =>
    api.get(`/seed-lots/${id}/genealogy`).then(
      (res) =>
        res.data as ApiResponse<{
          ancestors: SeedLot[];
          descendants: SeedLot[];
        }>
    ),
};

const varietyService = {
  getAll: (params?: Record<string, unknown>) =>
    api
      .get("/varieties", { params })
      .then((res) => res.data as ApiResponse<Variety[]>),
  getById: (id: string) =>
    api.get(`/varieties/${id}`).then((res) => res.data as ApiResponse<Variety>),
  create: (data: Partial<Variety>) =>
    api
      .post("/varieties", data)
      .then((res) => res.data as ApiResponse<Variety>),
  update: (id: string, data: Partial<Variety>) =>
    api
      .put(`/varieties/${id}`, data)
      .then((res) => res.data as ApiResponse<Variety>),
  delete: (id: string) =>
    api.delete(`/varieties/${id}`).then((res) => res.data as ApiResponse<void>),
};

const qualityControlService = {
  getAll: (params?: Record<string, unknown>) =>
    api
      .get("/quality-controls", { params })
      .then((res) => res.data as ApiResponse<QualityControl[]>),
  getById: (id: number) =>
    api
      .get(`/quality-controls/${id}`)
      .then((res) => res.data as ApiResponse<QualityControl>),
  create: (data: Partial<QualityControl>) =>
    api
      .post("/quality-controls", data)
      .then((res) => res.data as ApiResponse<QualityControl>),
};

const statisticsService = {
  getDashboard: () =>
    api
      .get("/statistics/dashboard")
      .then((res) => res.data as ApiResponse<DashboardStats>),
};

// Schémas de validation
const seedLotSchema = yup.object({
  varietyId: yup.number().required("Variété requise"),
  level: yup.string().required("Niveau requis"),
  quantity: yup
    .number()
    .positive("Quantité doit être positive")
    .required("Quantité requise"),
  productionDate: yup.string().required("Date de production requise"),
  notes: yup.string().optional(),
});

// Pages principales

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      // Error handled in login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            ISRA Seed Trace
          </h2>
          <p className="mt-2 text-center text-sm text-green-100">
            Système de traçabilité des semences
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
          </Card>
        </form>
        <div className="text-center">
          <p className="text-green-100 text-sm">
            Comptes de démonstration disponibles dans le README
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: statisticsService.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const overview = stats?.data?.overview || {};
  const distribution = stats?.data?.distribution || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lots totaux</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overview.totalSeedLots || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Productions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overview.totalProductions || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Multiplicateurs
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {overview.activeMultipliers || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Leaf className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Variétés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overview.totalVarieties || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Distribution par niveau">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribution.lotsByLevel || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top variétés">
          <div className="space-y-4">
            {distribution.topVarieties
              ?.slice(0, 5)
              .map((item, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.variety?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.variety?.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.count} lots</p>
                    <p className="text-sm text-gray-500">
                      {item.totalQuantity} kg
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const SeedLotsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    level: "",
    status: "",
    varietyId: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["seed-lots", { search, ...filters }],
    queryFn: () => seedLotService.getAll({ search, ...filters }),
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: seedLotService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seed-lots"] });
      toast.success("Lot supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      certified: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      "in-stock": { color: "bg-blue-100 text-blue-800", icon: Package },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap["pending"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const lots = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lots de semences</h1>
        <Link to="/seed-lots/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau lot
          </Button>
        </Link>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher un lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="Niveau"
            options={[
              { value: "GO", label: "GO" },
              { value: "G1", label: "G1" },
              { value: "G2", label: "G2" },
              { value: "R1", label: "R1" },
              { value: "R2", label: "R2" },
            ]}
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          />
          <Select
            placeholder="Statut"
            options={[
              { value: "certified", label: "Certifié" },
              { value: "pending", label: "En attente" },
              { value: "rejected", label: "Rejeté" },
              { value: "in-stock", label: "En stock" },
            ]}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          />
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setFilters({ level: "", status: "", varietyId: "" });
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </Card>

      {/* Tableau des lots */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Variété
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Multiplicateur
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lots.map((lot: SeedLot) => (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lot.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lot.variety.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {lot.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lot.quantity} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lot.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lot.multiplier?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/seed-lots/${lot.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Êtes-vous sûr de vouloir supprimer ce lot ?"
                              )
                            ) {
                              deleteMutation.mutate(lot.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

const SeedLotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["seed-lot", id],
    queryFn: () => seedLotService.getById(id!),
    enabled: !!id,
  });

  const { data: genealogy } = useQuery({
    queryKey: ["seed-lot-genealogy", id],
    queryFn: () => seedLotService.getGenealogy(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const lot = data?.data;

  if (!lot) {
    return <div className="text-center p-8">Lot non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lot {lot.id}</h1>
          <p className="text-gray-500">
            {lot.variety.name} - {lot.level}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary">
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <Card title="Informations du lot">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Variété
                </label>
                <p className="text-lg">
                  {lot.variety.name} ({lot.variety.code})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Niveau
                </label>
                <p className="text-lg">{lot.level}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Quantité
                </label>
                <p className="text-lg">{lot.quantity} kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date de production
                </label>
                <p className="text-lg">
                  {new Date(lot.productionDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Multiplicateur
                </label>
                <p className="text-lg">{lot.multiplier?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Parcelle
                </label>
                <p className="text-lg">{lot.parcel?.name || "N/A"}</p>
              </div>
            </div>
            {lot.notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">
                  Notes
                </label>
                <p className="text-gray-900">{lot.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Statut">
            <div className="text-center">
              <div className="mb-4">
                {lot.status === "certified" && (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                )}
                {lot.status === "pending" && (
                  <Clock className="h-16 w-16 text-yellow-500 mx-auto" />
                )}
                {lot.status === "rejected" && (
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                )}
              </div>
              <p className="text-lg font-semibold capitalize">{lot.status}</p>
            </div>
          </Card>

          {genealogy?.data && (
            <Card title="Généalogie">
              <div className="space-y-2">
                {genealogy.data.ancestors?.map((ancestor) => (
                  <div key={ancestor.id} className="text-sm">
                    <span className="text-gray-500">↑</span> {ancestor.id} (
                    {ancestor.level})
                  </div>
                ))}
                <div className="font-semibold text-blue-600">
                  • {lot.id} ({lot.level})
                </div>
                {genealogy.data.descendants?.map((descendant) => (
                  <div key={descendant.id} className="text-sm">
                    <span className="text-gray-500">↓</span> {descendant.id} (
                    {descendant.level})
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const NewSeedLotPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: varieties } = useQuery({
    queryKey: ["varieties"],
    queryFn: () => varietyService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: seedLotService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seed-lots"] });
      toast.success("Lot créé avec succès");
      navigate("/seed-lots");
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création"
      );
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SeedLotFormData>({
    resolver: yupResolver(seedLotSchema),
  });

  const onSubmit: SubmitHandler<SeedLotFormData> = (data) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Nouveau lot de semences
        </h1>
        <Link to="/seed-lots">
          <Button variant="secondary">Annuler</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variété *
              </label>
              <select
                {...register("varietyId", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sélectionner une variété</option>
                {varieties?.data?.map((variety: Variety) => (
                  <option key={variety.id} value={variety.id}>
                    {variety.name} ({variety.code})
                  </option>
                ))}
              </select>
              {errors.varietyId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.varietyId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau *
              </label>
              <select
                {...register("level")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sélectionner un niveau</option>
                <option value="GO">GO</option>
                <option value="G1">G1</option>
                <option value="G2">G2</option>
                <option value="G3">G3</option>
                <option value="G4">G4</option>
                <option value="R1">R1</option>
                <option value="R2">R2</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.level.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité (kg) *
              </label>
              <input
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="0"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de production *
              </label>
              <input
                type="date"
                {...register("productionDate")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              {errors.productionDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.productionDate.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Notes optionnelles..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/seed-lots">
              <Button variant="secondary">Annuler</Button>
            </Link>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Création..." : "Créer le lot"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const QualityControlPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["quality-controls"],
    queryFn: () => qualityControlService.getAll(),
  });

  const controls = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contrôle qualité</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau contrôle
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Germination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pureté
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Résultat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspecteur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {controls.map((control: QualityControl) => (
                  <tr key={control.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {control.lotId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {control.seedLot?.variety?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(control.controlDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {control.germinationRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {control.varietyPurity}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          control.result === "pass"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {control.result === "pass" ? "Réussi" : "Échec"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {control.inspector?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// Layout principal avec navigation
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: Package },
    { name: "Lots de semences", href: "/seed-lots", icon: Leaf },
    { name: "Contrôle qualité", href: "/quality-control", icon: CheckCircle },
    { name: "Variétés", href: "/varieties", icon: Package },
    { name: "Multiplicateurs", href: "/multipliers", icon: Users },
    { name: "Parcelles", href: "/parcels", icon: MapPin },
    { name: "Rapports", href: "/reports", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 bg-green-600">
          <Leaf className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">ISRA Seeds</span>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div></div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bonjour, {user?.name}
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

// Application principale
const App: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seed-lots"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SeedLotsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seed-lots/new"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NewSeedLotPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seed-lots/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SeedLotDetailPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quality-control"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QualityControlPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ToastContainer position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
