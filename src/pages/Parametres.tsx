import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, MapPin, Settings2, List, Bell, Globe, Package, UsersRound, UserPlus } from "lucide-react";
import Utilisateurs from "@/pages/Utilisateurs";
import Offres from "@/pages/Offres";
import Equipes from "@/pages/Equipes";
import AccountRequests from "@/pages/AccountRequests";
import GestionRoles from "@/pages/parametres/GestionRoles";
import GestionRegions from "@/pages/parametres/GestionRegions";
import ChampsPersonnalises from "@/pages/parametres/ChampsPersonnalises";
import GestionStatuts from "@/pages/parametres/GestionStatuts";
import ConfigurationSysteme from "@/pages/parametres/ConfigurationSysteme";
import GestionNotifications from "@/pages/parametres/GestionNotifications";

const Parametres = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground mt-1">
              Configuration et gestion de la plateforme
            </p>
          </div>

          <Tabs defaultValue="utilisateurs" className="space-y-4">
            <TabsList className="flex flex-wrap gap-1 h-auto p-1">
              <TabsTrigger value="utilisateurs" className="text-xs sm:text-sm">
                <Users className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Utilisateurs</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="equipes" className="text-xs sm:text-sm">
                <UsersRound className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Équipes</span>
                <span className="sm:hidden">Équipes</span>
              </TabsTrigger>
              <TabsTrigger value="demandes" className="text-xs sm:text-sm">
                <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Demandes Compte</span>
                <span className="sm:hidden">Demandes</span>
              </TabsTrigger>
              <TabsTrigger value="offres" className="text-xs sm:text-sm">
                <Package className="h-4 w-4 mr-1 sm:mr-2" />
                Offres & Promos
              </TabsTrigger>
              <TabsTrigger value="roles" className="text-xs sm:text-sm">
                <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                Rôles
              </TabsTrigger>
              <TabsTrigger value="regions" className="text-xs sm:text-sm">
                <MapPin className="h-4 w-4 mr-1 sm:mr-2" />
                Régions
              </TabsTrigger>
              <TabsTrigger value="statuts" className="text-xs sm:text-sm">
                <List className="h-4 w-4 mr-1 sm:mr-2" />
                Statuts
              </TabsTrigger>
              <TabsTrigger value="champs" className="text-xs sm:text-sm">
                <Settings2 className="h-4 w-4 mr-1 sm:mr-2" />
                Champs
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm">
                <Bell className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Notifs</span>
              </TabsTrigger>
              <TabsTrigger value="systeme" className="text-xs sm:text-sm">
                <Globe className="h-4 w-4 mr-1 sm:mr-2" />
                Système
              </TabsTrigger>
            </TabsList>

            <TabsContent value="utilisateurs">
              <Utilisateurs />
            </TabsContent>

            <TabsContent value="equipes">
              <Equipes />
            </TabsContent>

            <TabsContent value="demandes">
              <AccountRequests />
            </TabsContent>

            <TabsContent value="offres">
              <Offres />
            </TabsContent>

            <TabsContent value="roles">
              <GestionRoles />
            </TabsContent>

            <TabsContent value="regions">
              <GestionRegions />
            </TabsContent>

            <TabsContent value="champs">
              <ChampsPersonnalises />
            </TabsContent>

            <TabsContent value="statuts">
              <GestionStatuts />
            </TabsContent>

            <TabsContent value="notifications">
              <GestionNotifications />
            </TabsContent>

            <TabsContent value="systeme">
              <ConfigurationSysteme />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Parametres;
