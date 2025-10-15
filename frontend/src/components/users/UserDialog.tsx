// frontend/src/components/users/UserDialog.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react"; // ✅ Importer Eye et EyeOff
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { User, CreateUserData, UpdateUserData, ROLE_LABELS } from "../../types/user";

// Schéma de validation
const userSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
  role: z.enum(["admin", "manager", "inspector", "multiplier", "guest", "technician", "researcher"]),
  isActive: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  user?: User | null;
  isLoading?: boolean;
}

export const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}) => {
  const isEditing = !!user;
  const [showPassword, setShowPassword] = useState(false); // ✅ État pour afficher/masquer le mot de passe

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      isEditing 
        ? userSchema.omit({ password: true }) 
        : userSchema
    ),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }
      : {
          name: "",
          email: "",
          password: "",
          role: "guest",
          isActive: true,
        },
  });

  // Réinitialiser le formulaire quand le dialog s'ouvre/ferme
  React.useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        });
      } else {
        reset({
          name: "",
          email: "",
          password: "",
          role: "guest",
          isActive: true,
        });
      }
      setShowPassword(false); // ✅ Réinitialiser l'état à masqué
    }
  }, [open, user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data as CreateUserData | UpdateUserData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const roleValue = watch("role");
  const isActiveValue = watch("isActive");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom complet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Jean Dupont"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="exemple@domaine.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Mot de passe (uniquement en création) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // ✅ Basculer entre text et password
                  {...register("password")}
                  placeholder="Minimum 6 caractères"
                  disabled={isLoading}
                  className="pr-10" // ✅ Espace pour le bouton
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Rôle */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rôle <span className="text-red-500">*</span>
            </Label>
            <Select
              value={roleValue}
              onValueChange={(value) => setValue("role", value as any)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Statut actif */}
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="isActive" className="cursor-pointer">
              Compte actif
            </Label>
            <Switch
              id="isActive"
              checked={isActiveValue}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};