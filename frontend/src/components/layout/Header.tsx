// frontend/src/components/layout/Header.tsx
import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../../contexts/AuthContext";

const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // Mapping amélioré pour toutes les routes
    const breadcrumbMap: Record<string, string> = {
      "": "Tableau de bord",
      dashboard: "Tableau de bord",
      "seed-lots": "Lots de semences",
      seeds: "Lots de semences",
      varieties: "Variétés",
      multipliers: "Multiplicateurs",
      "quality-controls": "Contrôles qualité",
      quality: "Contrôles qualité",
      productions: "Productions",
      parcels: "Parcelles",
      genealogy: "Généalogie",
      reports: "Rapports",
      users: "Utilisateurs",
      settings: "Paramètres",
      create: "Créer",
      new: "Nouveau",
      edit: "Modifier",
      transfer: "Transférer",
    };

    // Cas spécial : page d'accueil ou dashboard seul
    if (
      pathSegments.length === 0 ||
      (pathSegments.length === 1 && pathSegments[0] === "dashboard")
    ) {
      return [
        {
          label: "Tableau de bord",
          href: "/dashboard",
          key: "dashboard-root", // Clé unique
        },
      ];
    }

    // Ne pas inclure "dashboard" dans les breadcrumbs si c'est le premier segment
    const filteredSegments =
      pathSegments[0] === "dashboard" ? pathSegments.slice(1) : pathSegments;

    const breadcrumbs = filteredSegments.map((segment, index) => {
      // Reconstruction du chemin complet
      const fullPath =
        pathSegments[0] === "dashboard"
          ? ["dashboard", ...filteredSegments.slice(0, index + 1)]
          : filteredSegments.slice(0, index + 1);

      const href = "/" + fullPath.join("/");

      // Détermination du label
      let label;
      if (segment.match(/^[A-Z0-9-]+$/i) && index > 0) {
        // C'est probablement un ID
        const previousSegment = filteredSegments[index - 1];
        const entityName = breadcrumbMap[previousSegment] || previousSegment;
        label = `${entityName} - ${segment}`;
      } else {
        label = breadcrumbMap[segment] || segment;
      }

      return {
        label,
        href,
        key: `breadcrumb-${fullPath.join("-")}`, // Clé unique basée sur le chemin
      };
    });

    // Toujours commencer par le tableau de bord
    return [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        key: "dashboard-home", // Clé différente de dashboard-root
      },
      ...breadcrumbs,
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.key}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          className="pl-9 w-full"
          aria-label="Recherche"
        />
      </div>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full" />
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Menu utilisateur">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {user?.name || user?.email || "Mon compte"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard/settings">Paramètres</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard/profile">Profil</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-red-600 cursor-pointer"
          >
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
