import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ClientHome from "./client/ClientHome";
import ClientDashboard from "./client/ClientDashboard";
import ClientPayment from "./client/ClientPayment";
import ClientPortfolio from "./client/ClientPortfolio";
import ClientPaymentHistory from "./client/ClientPaymentHistory";
import ClientStatistics from "./client/ClientStatistics";
import PaymentReturn from "./client/PaymentReturn";
import InstallPrompt from "@/components/pwa/InstallPrompt";

type View = 'home' | 'dashboard' | 'payment' | 'portfolio' | 'history' | 'statistics' | 'payment-return';

const ClientPortal = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<View>('home');
  const [souscripteur, setSouscripteur] = useState<any>(null);
  const [plantations, setPlantations] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);

  // Check if returning from payment
  useEffect(() => {
    const status = searchParams.get('status');
    const reference = searchParams.get('reference') || searchParams.get('ref');
    const transactionId = searchParams.get('id') || searchParams.get('transaction_id');
    
    if (status || reference || transactionId) {
      setView('payment-return');
    }
  }, [searchParams]);

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

  const handleBackFromPaymentReturn = () => {
    // Clear URL params and go to home or dashboard
    window.history.replaceState({}, '', window.location.pathname);
    if (souscripteur) {
      setView('dashboard');
    } else {
      setView('home');
    }
  };

  return (
    <>
      <InstallPrompt />
      
      {view === 'home' && (
        <ClientHome onLogin={handleLogin} />
      )}
      
      {view === 'dashboard' && (
        <ClientDashboard
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onPayment={() => setView('payment')}
          onPortfolio={() => setView('portfolio')}
          onHistory={() => setView('history')}
          onStatistics={() => setView('statistics')}
          onLogout={handleLogout}
        />
      )}
      
      {view === 'payment' && (
        <ClientPayment
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onBack={() => setView('dashboard')}
        />
      )}
      
      {view === 'portfolio' && (
        <ClientPortfolio
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'history' && (
        <ClientPaymentHistory
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'statistics' && (
        <ClientStatistics
          souscripteur={souscripteur}
          plantations={plantations}
          paiements={paiements}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'payment-return' && (
        <PaymentReturn onBack={handleBackFromPaymentReturn} />
      )}
    </>
  );
};

export default ClientPortal;
