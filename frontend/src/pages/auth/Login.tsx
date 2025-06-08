// frontend/src/pages/auth/Login.tsx - CORRECTION REDIRECTIONS
import React, { useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { toast } from "react-toastify";

interface LoginForm {
  email: string;
  password: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // ✅ CORRECTION: Redirect if already authenticated
  if (isAuthenticated) {
    // Get the intended destination from location state, or default to dashboard
    const from = (location.state as any)?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast.success("Connexion réussie !");

      // ✅ CORRECTION: Redirect to intended page or dashboard
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorResponse = error as ErrorResponse;
      const errorMessage =
        errorResponse?.response?.data?.message ||
        errorResponse?.message ||
        "Erreur de connexion. Vérifiez vos identifiants.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte ISRA Seeds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register("email", {
                required: "L'email est requis",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email invalide",
                },
              })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                {...register("password", {
                  required: "Le mot de passe est requis",
                  minLength: {
                    value: 5, // ✅ CORRECTION: Ajusté pour correspondre aux comptes de test
                    message:
                      "Le mot de passe doit contenir au moins 5 caractères",
                  },
                })}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>

        {/* ✅ AMÉLIORATION: Demo credentials avec boutons de connexion rapide */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Comptes de démonstration :
          </p>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                handleSubmit(() =>
                  onSubmit({ email: "admin@isra.sn", password: "12345" })
                )();
              }}
            >
              <strong className="mr-2">Admin :</strong> admin@isra.sn / 12345
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                handleSubmit(() =>
                  onSubmit({ email: "adiop@isra.sn", password: "12345" })
                )();
              }}
            >
              <strong className="mr-2">Chercheur :</strong> adiop@isra.sn /
              12345
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                handleSubmit(() =>
                  onSubmit({ email: "fsy@isra.sn", password: "12345" })
                )();
              }}
            >
              <strong className="mr-2">Technicien :</strong> fsy@isra.sn / 12345
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
