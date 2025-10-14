// frontend/src/components/layout/AppSidebar.tsx - CORRECTION LIGNE 161

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package,
  Leaf,
  Users,
  MapPin,
  Tractor,
  FlaskConical,
  GitBranch,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Home,
  Sprout,
  LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "../ui/sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";

// ✅ Types pour la navigation
interface NavigationSubItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  exact?: boolean;
  items?: NavigationSubItem[];
}

// ✅ STRUCTURE DE NAVIGATION UNIFIÉE ET COHÉRENTE
const navigationItems: NavigationItem[] = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: Home,
    exact: true,
  },
  {
    title: "Production",
    icon: Sprout,
    items: [
      {
        title: "Lots de semences",
        url: "/dashboard/seed-lots",
        icon: Package,
      },
      {
        title: "Variétés",
        url: "/dashboard/varieties",
        icon: Leaf,
      },
      {
        title: "Stations",
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
    icon: FlaskConical,
    items: [
      {
        title: "Contrôles qualité",
        url: "/dashboard/quality-controls",
        icon: FlaskConical,
      },
    ],
  },
  {
    title: "Traçabilité",
    icon: GitBranch,
    items: [
      {
        title: "Génération",
        url: "/dashboard/genealogy",
        icon: GitBranch,
      },
    ],
  },
  {
    title: "Analyses",
    icon: BarChart3,
    items: [
      {
        title: "Rapports",
        url: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
];

// ✅ Navigation admin (accessible uniquement aux administrateurs)
const adminNavigationItems: NavigationItem[] = [
  {
    title: "Administration",
    icon: Settings,
    items: [
      {
        title: "Utilisateurs",
        url: "/dashboard/users",
        icon: Users,
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // ✅ Fonction pour vérifier si un lien est actif
  const isActiveLink = (url: string, exact = false) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  // ✅ Fonction pour vérifier si un groupe contient un lien actif
  const isGroupActive = (items: NavigationSubItem[]) => {
    return items.some((item) => isActiveLink(item.url));
  };

  // ✅ CORRIGÉ: Vérifier si l'utilisateur est admin
  // Le rôle arrive en minuscules depuis le backend transformé
  const isAdmin = user?.role === "admin";

  // ✅ Fonction de déconnexion
  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar collapsible="icon">
      {/* ✅ Header avec logo et titre */}
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <div className="bg-green-600 rounded-lg p-2">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-semibold">ISRA Seeds</h2>
            <p className="text-xs text-muted-foreground">Traçabilité</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* ✅ Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation principale</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (item.items) {
                  // ✅ Menu avec sous-éléments
                  const isOpen = isGroupActive(item.items);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className={cn(
                          "font-medium",
                          isOpen && "bg-muted text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isActive = isActiveLink(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  isActive && "bg-accent text-accent-foreground"
                                )}
                              >
                                <Link to={subItem.url}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  );
                } else {
                  // ✅ Menu simple
                  const isActive = isActiveLink(item.url!, item.exact);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "font-medium",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Link to={item.url!}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ✅ Navigation admin (visible uniquement pour les admins) */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigationItems.map((item) => {
                  if (item.items) {
                    const isOpen = isGroupActive(item.items);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          className={cn(
                            "font-medium",
                            isOpen && "bg-muted text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => {
                            const isActive = isActiveLink(subItem.url);
                            return (
                              <SidebarMenuSubItem key={subItem.url}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn(
                                    isActive &&
                                      "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <Link to={subItem.url}>
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    );
                  } else {
                    const isActive = isActiveLink(item.url!, item.exact);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "font-medium",
                            isActive && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Link to={item.url!}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ✅ Footer avec déconnexion */}
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
