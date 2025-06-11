// frontend/src/components/layout/AppSidebar.tsx - SIDEBAR CORRIGÉE
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";
import {
  Home,
  Leaf,
  Sprout,
  Users,
  FlaskConical,
  Tractor,
  FileText,
  Settings,
  User,
  LogOut,
  MapPin,
  GitBranch,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Routes principales avec chemins dashboard corrigés
  const navigation = [
    {
      title: "Vue d'ensemble",
      items: [
        {
          title: "Tableau de bord",
          url: "/dashboard",
          icon: Home,
        },
      ],
    },
    {
      title: "Gestion des semences",
      items: [
        {
          title: "Lots de semences",
          url: "/dashboard/seeds",
          icon: Sprout,
        },
        {
          title: "Variétés",
          url: "/dashboard/varieties",
          icon: Leaf,
        },
        {
          title: "Généalogie",
          url: "/dashboard/genealogy",
          icon: GitBranch,
        },
      ],
    },
    {
      title: "Production",
      items: [
        {
          title: "Multiplicateurs",
          url: "/dashboard/multipliers",
          icon: Users,
        },
        {
          title: "Parcelles",
          url: "/dashboard/parcels",
          icon: MapPin,
        },
        {
          title: "Productions",
          url: "/dashboard/productions",
          icon: Tractor,
        },
      ],
    },
    {
      title: "Qualité",
      items: [
        {
          title: "Contrôles qualité",
          url: "/dashboard/quality",
          icon: FlaskConical,
        },
      ],
    },
    {
      title: "Rapports",
      items: [
        {
          title: "Rapports",
          url: "/dashboard/reports",
          icon: FileText,
        },
      ],
    },
  ];

  const adminNavigation = [
    {
      title: "Administration",
      items: [
        {
          title: "Utilisateurs",
          url: "/dashboard/users",
          icon: User,
        },
        {
          title: "Paramètres",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];

  // Fonction isActive corrigée pour gérer les chemins dashboard
  const isActive = (url: string) => {
    const currentPath = location.pathname;

    // Pour le dashboard principal
    if (url === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/dashboard/";
    }

    // Pour les autres routes, vérifier si l'URL commence par le chemin
    return currentPath.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center space-x-2 px-4 py-2">
          <Leaf className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-lg font-semibold">ISRA Seeds</h1>
            <p className="text-xs text-muted-foreground">Traçabilité</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Section administration pour les admins */}
        {user?.role === "ADMIN" && (
          <>
            {adminNavigation.map((group, index) => (
              <SidebarGroup key={`admin-${index}`}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                        >
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || "Utilisateur"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "email@example.com"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
