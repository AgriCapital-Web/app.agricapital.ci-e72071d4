import { useState, useEffect } from "react";
import ClientHome from "./client/ClientHome";
import ClientDashboard from "./client/ClientDashboard";
import ClientPayment from "./client/ClientPayment";
import ClientPortfolio from "./client/ClientPortfolio";

type View = 'home' | 'dashboard' | 'payment' | 'portfolio';

const ClientPortal = () => {
  const [view, setView] = useState<View>('home');
  const [souscripteur, setSouscripteur] = useState<any>(null);
  const [plantations, setPlantations] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);

  // Mettre le titre et le manifest pour le portail abonné
  useEffect(() => {
    document.title = "Portail Abonné | AgriCapital";
    
    // Changer le manifest pour le PWA
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.setAttribute('href', '/manifest-client.json');
    }

    // Changer le theme-color
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', '#00643C');
    }
  }, []);

  const handleLogin = (sous: any, plants: any[], paies: any[]) => {
    setSouscripteur(sous);
    setPlantations(plants);
    setPaiements(paies);
    setView('dashboard');
  };

  const handleLogout = () => {
    setSouscripteur(null);
    setPlantations([]);
    setPaiements([]);
    setView('home');
  };

  switch (view) {
    case 'home':
      return <ClientHome onLogin={handleLogin} />;
    
    case 'dashboard':
      return (
        <ClientDashboard
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onPayment={() => setView('payment')}
          onPortfolio={() => setView('portfolio')}
          onLogout={handleLogout}
        />
      );
    
    case 'payment':
      return (
        <ClientPayment
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onBack={() => setView('dashboard')}
        />
      );
    
    case 'portfolio':
      return (
        <ClientPortfolio
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onBack={() => setView('dashboard')}
        />
      );
    
    default:
      return <ClientHome onLogin={handleLogin} />;
  }
};

export default ClientPortal;
