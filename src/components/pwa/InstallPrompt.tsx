import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);

    // Ne pas afficher si déjà installé
    if (isInStandaloneMode) return;

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Vérifier si l'utilisateur n'a pas déjà refusé
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Afficher le prompt iOS après un délai
    if (isIOSDevice && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installée');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom">
      <Card className="bg-primary text-white shadow-2xl border-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Smartphone className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Installer AgriCapital</h3>
              {isIOS ? (
                <p className="text-sm text-white/80 mt-1">
                  Appuyez sur <span className="font-bold">Partager</span> puis{' '}
                  <span className="font-bold">"Sur l'écran d'accueil"</span>
                </p>
              ) : (
                <p className="text-sm text-white/80 mt-1">
                  Accédez rapidement à votre portail depuis l'écran d'accueil
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 -mt-1 -mr-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {!isIOS && deferredPrompt && (
            <Button 
              onClick={handleInstall}
              className="w-full mt-4 bg-white text-primary hover:bg-white/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Installer l'application
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;
