// frontend/src/components/layout/AppSidebar.tsx
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
  Seedling,
  Users,
  FlaskConical,
  Tractor,
  FileText,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    {
      title: "Vue d'ensemble",
      items: [
        {
          title: "Tableau de bord",
          url: "/",
          icon: Home,
        },
      ],
    },
    {
      title: "Gestion des semences",
      items: [
        {
          title: "Lots de semences",
          url: "/seeds",
          icon: Seedling,
        },
        {
          title: "Variétés",
          url: "/varieties",
          icon: Leaf,
        },
      ],
    },
    {
      title: "Production",
      items: [
        {
          title: "Multiplicateurs",
          url: "/multipliers",
          icon: Users,
        },
        {
          title: "Productions",
          url: "/productions",
          icon: Tractor,
        },
      ],
    },
    {
      title: "Qualité",
      items: [
        {
          title: "Contrôles qualité",
          url: "/quality",
          icon: FlaskConical,
        },
      ],
    },
    {
      title: "Rapports",
      items: [
        {
          title: "Rapports",
          url: "/reports",
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
          url: "/users",
          icon: User,
        },
        {
          title: "Paramètres",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
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

        {user?.role === "admin" && (
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
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
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
