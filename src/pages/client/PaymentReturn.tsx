import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoWhite from "@/assets/logo-white.png";
import { CheckCircle, XCircle, Loader2, Home, RefreshCw } from "lucide-react";

interface PaymentReturnProps {
  onBack: () => void;
}

const PaymentReturn = ({ onBack }: PaymentReturnProps) => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [paiement, setPaiement] = useState<any>(null);
  const [checkCount, setCheckCount] = useState(0);

  const reference = searchParams.get('reference') || searchParams.get('ref');
  const fedapayStatus = searchParams.get('status');
  const transactionId = searchParams.get('id') || searchParams.get('transaction_id');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!reference && !transactionId) {
        // No reference, try to get from URL or show pending
        setStatus('pending');
        return;
      }

      try {
        // Query payment by reference or fedapay_transaction_id
        let query = supabase.from('paiements').select(`
          *,
          plantations (nom_plantation, id_unique),
          souscripteurs (nom_complet, telephone)
        `);

        if (reference) {
          query = query.eq('reference', reference);
        } else if (transactionId) {
          query = query.eq('fedapay_transaction_id', transactionId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;

        if (data) {
          setPaiement(data);
          
          if (data.statut === 'valide') {
            setStatus('success');
          } else if (data.statut === 'echec' || data.statut === 'rejete') {
            setStatus('error');
          } else {
            // Still pending, check URL status
            if (fedapayStatus === 'approved' || fedapayStatus === 'completed' || fedapayStatus === 'success') {
              // FedaPay says success but webhook hasn't processed yet
              // Update locally
              const { error: updateError } = await supabase
                .from('paiements')
                .update({
                  statut: 'valide',
                  fedapay_transaction_id: transactionId || undefined,
                  date_paiement: new Date().toISOString(),
                  montant_paye: data.montant
                })
                .eq('id', data.id);

              if (!updateError) {
                setStatus('success');
                setPaiement({ ...data, statut: 'valide' });
              } else {
                setStatus('pending');
              }
            } else if (fedapayStatus === 'declined' || fedapayStatus === 'failed' || fedapayStatus === 'cancelled') {
              const { error: updateError } = await supabase
                .from('paiements')
                .update({ statut: 'echec' })
                .eq('id', data.id);

              if (!updateError) {
                setStatus('error');
                setPaiement({ ...data, statut: 'echec' });
              }
            } else {
              // Still waiting for webhook
              if (checkCount < 5) {
                setTimeout(() => setCheckCount(c => c + 1), 3000);
              }
              setStatus('pending');
            }
          }
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Error checking payment:', error);
        setStatus('pending');
      }
    };

    checkPaymentStatus();
  }, [reference, transactionId, fedapayStatus, checkCount]);

  const formatMontant = (m: number) => {
    return new Intl.NumberFormat("fr-FR").format(m || 0) + " F CFA";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/85 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container mx-auto flex justify-center">
          <img 
            src={logoWhite} 
            alt="AgriCapital" 
            className="h-16 object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            {status === 'loading' && (
              <>
                <Loader2 className="h-20 w-20 text-primary mx-auto animate-spin" />
                <h2 className="text-xl font-bold">Vérification du paiement...</h2>
                <p className="text-muted-foreground">Veuillez patienter</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto relative" />
                </div>
                <h2 className="text-2xl font-bold text-green-600">Paiement réussi !</h2>
                <p className="text-muted-foreground">
                  Votre paiement a été confirmé avec succès.
                </p>
                
                {paiement && (
                  <div className="bg-green-50 rounded-lg p-4 text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-bold text-green-600">{formatMontant(paiement.montant_paye || paiement.montant)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{paiement.type_paiement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Référence</span>
                      <span className="font-mono text-sm">{paiement.reference}</span>
                    </div>
                    {paiement.plantations && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plantation</span>
                        <span className="font-medium">{paiement.plantations.nom_plantation || paiement.plantations.id_unique}</span>
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={onBack} className="w-full h-12 gap-2">
                  <Home className="h-5 w-5" />
                  Retour à l'accueil
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-20 w-20 text-red-500 mx-auto" />
                <h2 className="text-2xl font-bold text-red-600">Paiement échoué</h2>
                <p className="text-muted-foreground">
                  Votre paiement n'a pas pu être traité. Veuillez réessayer ou contacter le support.
                </p>
                
                {paiement && (
                  <div className="bg-red-50 rounded-lg p-4 text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Montant</span>
                      <span className="font-bold">{formatMontant(paiement.montant)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Référence</span>
                      <span className="font-mono text-sm">{paiement.reference}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button onClick={onBack} className="w-full h-12 gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Réessayer
                  </Button>
                  <Button variant="outline" onClick={onBack} className="w-full">
                    Retour à l'accueil
                  </Button>
                </div>
              </>
            )}

            {status === 'pending' && (
              <>
                <div className="relative">
                  <Loader2 className="h-20 w-20 text-amber-500 mx-auto animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-amber-600">Paiement en cours de traitement</h2>
                <p className="text-muted-foreground">
                  Votre paiement est en cours de vérification. Cela peut prendre quelques instants.
                </p>
                
                {checkCount < 5 && (
                  <p className="text-sm text-muted-foreground">
                    Vérification automatique... ({checkCount + 1}/5)
                  </p>
                )}

                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCheckCount(c => c + 1)}
                    className="w-full gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Actualiser le statut
                  </Button>
                  <Button onClick={onBack} className="w-full">
                    Retour à l'accueil
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-white/90 text-sm">
        <p>Support: +225 05 64 55 17 17</p>
        <p className="text-xs text-white/70 mt-1">© 2025 AgriCapital</p>
      </footer>
    </div>
  );
};

export default PaymentReturn;
