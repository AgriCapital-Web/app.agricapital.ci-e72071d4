import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoWhite from "@/assets/logo-white.png";
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Sprout, 
  CreditCard,
  Wallet,
  ArrowRight,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientDashboardProps {
  souscripteur: any;
  plantations: any[];
  paiements: any[];
  onPayment: () => void;
  onPortfolio: () => void;
  onLogout: () => void;
}

const ClientDashboard = ({ 
  souscripteur, 
  plantations, 
  paiements, 
  onPayment, 
  onPortfolio, 
  onLogout 
}: ClientDashboardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMontant = (m: number) => {
    return new Intl.NumberFormat("fr-FR").format(m || 0) + " F CFA";
  };

  // Calculer les statistiques
  const totalHectares = plantations.reduce((sum, p) => sum + (p.superficie_ha || 0), 0);
  const totalDAVerse = souscripteur.total_da_verse || 0;
  const totalContributions = souscripteur.total_contributions_versees || 0;
  
  // Calculer les arriérés (simplifié - 65F/jour)
  const calculateArrieres = () => {
    let totalArrieres = 0;
    let joursRetard = 0;
    
    plantations.forEach(plantation => {
      if (plantation.statut_global === 'en_cours' || plantation.statut_global === 'da_valide') {
        const dateActivation = plantation.date_activation ? new Date(plantation.date_activation) : null;
        if (dateActivation) {
          const joursDepuisActivation = Math.floor((new Date().getTime() - dateActivation.getTime()) / (1000 * 60 * 60 * 24));
          const montantAttendu = joursDepuisActivation * 65 * plantation.superficie_activee;
          const montantPaye = paiements
            .filter(p => p.plantation_id === plantation.id && p.type_paiement === 'contribution' && p.statut === 'valide')
            .reduce((sum, p) => sum + (p.montant_paye || 0), 0);
          
          if (montantAttendu > montantPaye) {
            const retard = montantAttendu - montantPaye;
            totalArrieres += retard;
            joursRetard = Math.max(joursRetard, Math.floor(retard / (65 * plantation.superficie_activee)));
          }
        }
      }
    });
    
    return { totalArrieres, joursRetard };
  };

  const { totalArrieres, joursRetard } = calculateArrieres();
  const hasArrieres = totalArrieres > 0;

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AC';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-primary text-white py-3 px-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="AgriCapital" className="h-10 object-contain" />
            <span className="text-sm font-medium hidden sm:block">Portail Abonné</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-white hover:bg-white/20 gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        {/* Welcome Card with Photo */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0 shadow-xl overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              {/* Photo avec bordure stylisée vert-doré */}
              <div className="relative flex-shrink-0">
                <div className="relative">
                  {/* Border gradient effect */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-white via-transparent to-accent rounded-full"></div>
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-white/30">
                    {souscripteur.photo_profil_url ? (
                      <img 
                        src={souscripteur.photo_profil_url} 
                        alt={souscripteur.nom_complet}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-white/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {getInitials(souscripteur.nom_complet)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Decorative corner borders - vert/doré */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-[3px] border-l-[3px] border-white rounded-tl-xl"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-[3px] border-r-[3px] border-accent rounded-br-xl"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm opacity-90">Bienvenue,</p>
                <h2 className="text-lg sm:text-xl font-bold truncate">{souscripteur.nom_complet}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
                  <Phone className="h-3 w-3" />
                  <span>{souscripteur.telephone}</span>
                </div>
                <p className="text-xs opacity-80 mt-1 font-mono">
                  {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert if arriérés */}
        {hasArrieres && (
          <Card className="bg-red-50 border-red-200 animate-pulse">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">⚠️ Arriéré de paiement</p>
                <p className="text-sm text-red-600">
                  {joursRetard} jour(s) de retard • {formatMontant(totalArrieres)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Sprout className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{plantations.length}</p>
              <p className="text-xs text-muted-foreground">Plantation(s)</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-accent">{totalHectares}</p>
              <p className="text-xs text-muted-foreground">Hectare(s)</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onPayment}
            className="w-full h-16 text-lg font-semibold bg-accent hover:bg-accent/90 text-white gap-3 shadow-lg hover:shadow-xl transition-all"
          >
            <CreditCard className="h-6 w-6" />
            Effectuer un paiement
            <ArrowRight className="h-5 w-5 ml-auto" />
          </Button>

          <Button 
            onClick={onPortfolio}
            variant="outline"
            className="w-full h-16 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white gap-3 transition-all"
          >
            <Wallet className="h-6 w-6" />
            Accéder à mon portefeuille
            <ArrowRight className="h-5 w-5 ml-auto" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">DA Versé</span>
              </div>
              <p className="text-sm font-bold">{formatMontant(totalDAVerse)}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Contributions</span>
              </div>
              <p className="text-sm font-bold">{formatMontant(totalContributions)}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">Membre depuis</span>
              </div>
              <p className="text-sm font-medium">
                {souscripteur.created_at 
                  ? format(new Date(souscripteur.created_at), "MMM yyyy", { locale: fr })
                  : 'N/A'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-muted-foreground">Paiements</span>
              </div>
              <p className="text-sm font-bold">{paiements.filter(p => p.statut === 'valide').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Besoin d'aide ?</p>
            <a 
              href="tel:+2250564551717" 
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <Phone className="h-4 w-4" />
              +225 05 64 55 17 17
            </a>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4 mt-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 AgriCapital - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ClientDashboard;
