import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Gift, Shield, MapPin, Settings2, List, Bell, Globe, Package, UsersRound } from "lucide-react";
import Utilisateurs from "@/pages/Utilisateurs";
import Promotions from "@/pages/Promotions";
import Offres from "@/pages/Offres";
import Equipes from "@/pages/Equipes";
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
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="utilisateurs">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="equipes">
                <UsersRound className="h-4 w-4 mr-2" />
                Équipes
              </TabsTrigger>
              <TabsTrigger value="offres">
                <Package className="h-4 w-4 mr-2" />
                Offres
              </TabsTrigger>
              <TabsTrigger value="promotions">
                <Gift className="h-4 w-4 mr-2" />
                Promotions
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="h-4 w-4 mr-2" />
                Rôles
              </TabsTrigger>
              <TabsTrigger value="regions">
                <MapPin className="h-4 w-4 mr-2" />
                Régions
              </TabsTrigger>
              <TabsTrigger value="statuts">
                <List className="h-4 w-4 mr-2" />
                Statuts
              </TabsTrigger>
              <TabsTrigger value="champs">
                <Settings2 className="h-4 w-4 mr-2" />
                Champs
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="systeme">
                <Globe className="h-4 w-4 mr-2" />
                Système
              </TabsTrigger>
            </TabsList>

            <TabsContent value="utilisateurs">
              <Utilisateurs />
            </TabsContent>

            <TabsContent value="equipes">
              <Equipes />
            </TabsContent>

            <TabsContent value="offres">
              <Offres />
            </TabsContent>

            <TabsContent value="promotions">
              <Promotions />
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
