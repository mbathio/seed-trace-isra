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
import { Bell, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const Header: React.FC = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    const breadcrumbMap: Record<string, string> = {
      "": "Tableau de bord",
      seeds: "Lots de semences",
      varieties: "Variétés",
      multipliers: "Multiplicateurs",
      quality: "Contrôles qualité",
      productions: "Productions",
      reports: "Rapports",
      users: "Utilisateurs",
      settings: "Paramètres",
      create: "Créer",
    };

    if (pathSegments.length === 0) {
      return [{ label: "Tableau de bord", href: "/" }];
    }

    const breadcrumbs = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = breadcrumbMap[segment] || segment;
      return { label, href };
    });

    return [{ label: "Tableau de bord", href: "/" }, ...breadcrumbs];
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
