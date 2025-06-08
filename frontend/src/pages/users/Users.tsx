// frontend/src/pages/users/Users.tsx
import React from "react";
import { Plus, Users as UsersIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const Users: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Gestion des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Page de gestion des utilisateurs en cours de développement...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
