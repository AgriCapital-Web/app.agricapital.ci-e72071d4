import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    openKkiapayWidget: (config: KkiapayConfig) => void;
    addKkiapayCloseListener: (callback: () => void) => void;
    addKkiapaySuccessListener: (callback: (response: KkiapayResponse) => void) => void;
    addKkiapayFailedListener: (callback: (response: KkiapayError) => void) => void;
    removeKkiapayCloseListener: (callback: () => void) => void;
    removeKkiapaySuccessListener: (callback: () => void) => void;
    removeKkiapayFailedListener: (callback: () => void) => void;
  }
}

export interface KkiapayConfig {
  amount: number;
  key: string;
  sandbox?: boolean;
  email?: string;
  phone?: string;
  name?: string;
  callback?: string;
  data?: Record<string, any>;
  theme?: string;
  countries?: string[];
  paymentMethods?: string[];
}

export interface KkiapayResponse {
  transactionId: string;
  isPaymentSucces?: boolean;
  account?: string;
  label?: string;
  method?: string;
  amount?: number;
  fees?: number;
  partnerId?: string;
  performedAt?: string;
  stateData?: Record<string, any>;
  event?: string;
}

export interface KkiapayError {
  reason: string;
  error?: string;
}

// KKiaPay public key from environment
const KKIAPAY_PUBLIC_KEY = '193bbb7e7387d1c3ac16ced9d47fe52fad2b228e';

export const useKkiapay = () => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    // Check if script is already loaded
    if (document.querySelector('script[src="https://cdn.kkiapay.me/k.js"]')) {
      scriptLoaded.current = true;
      return;
    }

    // Load KKiaPay script
    const script = document.createElement('script');
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
      console.log('KKiaPay SDK loaded');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup listeners on unmount
    };
  }, []);

  const openPayment = (config: Omit<KkiapayConfig, 'key'>) => {
    if (!window.openKkiapayWidget) {
      console.error('KKiaPay SDK not loaded');
      return false;
    }

    window.openKkiapayWidget({
      ...config,
      key: KKIAPAY_PUBLIC_KEY,
      sandbox: false, // Production mode
      countries: ['CI'], // Côte d'Ivoire
      paymentMethods: ['momo', 'card', 'wave'] // Mobile money, carte, Wave
    });
    
    return true;
  };

  const onSuccess = (callback: (response: KkiapayResponse) => void) => {
    if (window.addKkiapaySuccessListener) {
      window.addKkiapaySuccessListener(callback);
    }
  };

  const onFailed = (callback: (error: KkiapayError) => void) => {
    if (window.addKkiapayFailedListener) {
      window.addKkiapayFailedListener(callback);
    }
  };

  const onClose = (callback: () => void) => {
    if (window.addKkiapayCloseListener) {
      window.addKkiapayCloseListener(callback);
    }
  };

  return {
    openPayment,
    onSuccess,
    onFailed,
    onClose,
    isLoaded: scriptLoaded.current
  };
};

export default useKkiapay;
