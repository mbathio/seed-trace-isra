// frontend/src/components/layout/Header.tsx - ✅ CORRECTION BREADCRUMBS avec routes standardisées
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
import { Bell, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const Header: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // ✅ CORRECTION: Mapping amélioré pour les routes standardisées
    const breadcrumbMap: Record<string, string> = {
      "": "Tableau de bord",
      dashboard: "Tableau de bord",
      "seed-lots": "Lots de semences", // ✅ AJOUTÉ: Support kebab-case
      seeds: "Lots de semences", // ✅ Rétrocompatibilité
      varieties: "Variétés",
      multipliers: "Multiplicateurs",
      "quality-controls": "Contrôles qualité", // ✅ AJOUTÉ: Support kebab-case
      quality: "Contrôles qualité", // ✅ Rétrocompatibilité
      productions: "Productions",
      parcels: "Parcelles",
      genealogy: "Généalogie",
      reports: "Rapports",
      users: "Utilisateurs",
      settings: "Paramètres",
      create: "Créer",
      edit: "Modifier",
    };

    // ✅ CORRECTION: Gestion spéciale pour la route racine et dashboard
    if (
      pathSegments.length === 0 ||
      (pathSegments.length === 1 && pathSegments[0] === "dashboard")
    ) {
      return [{ label: "Tableau de bord", href: "/dashboard" }];
    }

    const breadcrumbs = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");

      // ✅ CORRECTION: Gestion améliorée des IDs et segments kebab-case
      let label;
      if (segment.match(/^[A-Z0-9-]+$/i) && index > 0) {
        // C'est probablement un ID, utiliser le segment précédent + "Détail"
        const previousSegment = pathSegments[index - 1];
        const entityName = breadcrumbMap[previousSegment] || previousSegment;
        label = `${entityName} - ${segment}`;
      } else {
        label = breadcrumbMap[segment] || segment;
      }

      return { label, href };
    });

    // ✅ CORRECTION: Toujours commencer par le tableau de bord
    return [{ label: "Tableau de bord", href: "/dashboard" }, ...breadcrumbs];
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
            <React.Fragment key={breadcrumb.href}>
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
        <Input placeholder="Rechercher..." className="pl-9 w-full" />
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></span>
      </Button>
    </header>
  );
};

export default Header;
