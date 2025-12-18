import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Planteurs from "./pages/Souscriptions";
import PlanteurDetail from "./pages/PlanteurDetail";
import Plantations from "./pages/Plantations";
import Paiements from "./pages/Paiements";
import Utilisateurs from "./pages/Utilisateurs";
import RapportsFinanciers from "./pages/RapportsFinanciers";
import RapportsTechniques from "./pages/RapportsTechniques";
import Commissions from "./pages/Commissions";
import PortefeuilleClients from "./pages/PortefeuilleClients";
import Portefeuilles from "./pages/Portefeuilles";
import Equipes from "./pages/Equipes";
import Promotions from "./pages/Promotions";
import Offres from "./pages/Offres";
import NouvelleSouscription from "./pages/NouvelleSouscription";
import Parametres from "./pages/Parametres";
import HistoriqueComplet from "./pages/HistoriqueComplet";
import AccountRequest from "./pages/AccountRequest";
import AccountRequests from "./pages/AccountRequests";
import CreateSuperAdmin from "./pages/CreateSuperAdmin";
import PaiementsWave from "./pages/PaiementsWave";
import Tickets from "./pages/Tickets";
import ClientPortal from "./pages/ClientPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour détecter le domaine et rediriger
const DomainRouter = () => {
  const [isClientDomain, setIsClientDomain] = useState<boolean | null>(null);
  const [routeType, setRouteType] = useState<'client' | 'admin' | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // Vérifier si c'est le sous-domaine pay ou client
    const isPayDomain = 
      hostname === 'pay.agricapital.ci' || 
      hostname === 'client.agricapital.ci' ||
      hostname === 'abonne.agricapital.ci' ||
      hostname.startsWith('pay.') ||
      hostname.startsWith('client.') ||
      hostname.startsWith('abonne.');
    
    // Vérifier si c'est une route portail abonné sur le domaine principal
    // Support pour les accents et sans accents
    const isClientRoute = 
      pathname.startsWith('/pay') ||
      pathname.startsWith('/client') ||
      pathname.startsWith('/abonne') ||
      pathname.startsWith('/abonn%C3%A9') ||
      decodeURIComponent(pathname).startsWith('/abonné');
    
    if (isPayDomain) {
      setIsClientDomain(true);
      setRouteType('client');
    } else if (isClientRoute) {
      setIsClientDomain(false);
      setRouteType('client');
    } else {
      setIsClientDomain(false);
      setRouteType('admin');
    }
  }, []);

  // Attendre la détection du domaine
  if (routeType === null) {
    return null;
  }

  // Si c'est le domaine client (pay.agricapital.ci), afficher le portail abonné
  if (isClientDomain) {
    return (
      <Routes>
        <Route path="*" element={<ClientPortal />} />
      </Routes>
    );
  }

  // Sinon, afficher l'application de gestion normale avec toutes les routes
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account-request" element={<AccountRequest />} />
      <Route path="/create-super-admin" element={<CreateSuperAdmin />} />
      
      {/* Client Portal routes - accessible via /pay, /client, /abonne sur n'importe quel domaine */}
      <Route path="/pay" element={<ClientPortal />} />
      <Route path="/pay/*" element={<ClientPortal />} />
      <Route path="/client" element={<ClientPortal />} />
      <Route path="/client/*" element={<ClientPortal />} />
      <Route path="/abonne" element={<ClientPortal />} />
      <Route path="/abonne/*" element={<ClientPortal />} />
      <Route path="/abonné" element={<ClientPortal />} />
      <Route path="/abonné/*" element={<ClientPortal />} />
      
      {/* Protected routes - Dashboard & Core */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/account-requests" element={<AccountRequests />} />
      
      {/* Planteurs & Plantations */}
      <Route path="/souscriptions" element={<Planteurs />} />
      <Route path="/planteur/:id" element={<PlanteurDetail />} />
      <Route path="/planteur/:id/historique" element={<HistoriqueComplet />} />
      <Route path="/plantations" element={<Plantations />} />
      <Route path="/nouvelle-souscription" element={<NouvelleSouscription />} />
      
      {/* Paiements */}
      <Route path="/paiements" element={<Paiements />} />
      <Route path="/paiements-wave" element={<PaiementsWave />} />
      
      {/* Équipes & Utilisateurs */}
      <Route path="/utilisateurs" element={<Utilisateurs />} />
      <Route path="/equipes" element={<Equipes />} />
      
      {/* Rapports */}
      <Route path="/rapports-financiers" element={<RapportsFinanciers />} />
      <Route path="/rapports-techniques" element={<RapportsTechniques />} />
      
      {/* Finances */}
      <Route path="/commissions" element={<Commissions />} />
      <Route path="/portefeuille-clients" element={<PortefeuilleClients />} />
      <Route path="/portefeuilles" element={<Portefeuilles />} />
      
      {/* Support */}
      <Route path="/tickets" element={<Tickets />} />
      
      {/* Admin */}
      <Route path="/promotions" element={<Promotions />} />
      <Route path="/offres" element={<Offres />} />
      <Route path="/parametres" element={<Parametres />} />
      
      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DomainRouter />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
