import { forwardRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import logoGreen from "@/assets/logo-green.png";

interface PaymentReceiptProps {
  paiement: {
    id: string;
    reference?: string;
    type_paiement?: string;
    montant?: number;
    montant_paye?: number;
    date_paiement?: string;
    created_at?: string;
    statut?: string;
    mode_paiement?: string;
    fedapay_transaction_id?: string;
  };
  souscripteur: {
    id_unique?: string;
    nom_complet?: string;
    telephone?: string;
    email?: string;
  };
  plantation?: {
    id_unique?: string;
    nom_plantation?: string;
    superficie_ha?: number;
    regions?: { nom?: string };
  };
}

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(
  ({ paiement, souscripteur, plantation }, ref) => {
    const formatMontant = (m: number) => {
      return new Intl.NumberFormat("fr-FR").format(m || 0) + " F CFA";
    };

    const receiptNumber = `REC-${paiement.reference?.split('-')[1] || Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const dateEmission = new Date();

    return (
      <div 
        ref={ref}
        className="bg-white p-8 max-w-[800px] mx-auto font-serif text-gray-900"
        style={{ 
          minHeight: '1100px',
          backgroundImage: 'linear-gradient(to bottom, rgba(0,100,60,0.02) 0%, transparent 100%)',
          border: '2px solid #00643C'
        }}
      >
        {/* Header with Logo and Company Info */}
        <div className="border-b-4 border-[#00643C] pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img src={logoGreen} alt="AgriCapital" className="h-20 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-[#00643C]">AgriCapital</h1>
                <p className="text-sm text-gray-600">La Palmeraie Verte du Progrès Solidaire</p>
                <p className="text-xs text-gray-500 mt-1">RCCM: CI-ABJ-2024-B-XXXXX</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p className="font-semibold text-[#00643C]">Siège Social</p>
              <p>Abidjan, Côte d'Ivoire</p>
              <p>Tél: +225 05 64 55 17 17</p>
              <p>Email: contact@agricapital.ci</p>
              <p>www.agricapital.ci</p>
            </div>
          </div>
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#00643C] text-white px-8 py-3 rounded-lg">
            <h2 className="text-2xl font-bold tracking-wide">REÇU DE PAIEMENT</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm max-w-md mx-auto">
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-gray-500">N° Reçu</p>
              <p className="font-bold text-[#00643C]">{receiptNumber}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-gray-500">Date d'émission</p>
              <p className="font-bold">{format(dateEmission, "dd MMMM yyyy", { locale: fr })}</p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#00643C]">
          <h3 className="font-bold text-[#00643C] mb-2 text-lg">INFORMATIONS DU PARTENAIRE</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Nom complet</p>
              <p className="font-semibold text-lg">{souscripteur.nom_complet}</p>
            </div>
            <div>
              <p className="text-gray-500">ID Partenaire</p>
              <p className="font-semibold">{souscripteur.id_unique}</p>
            </div>
            <div>
              <p className="text-gray-500">Téléphone</p>
              <p className="font-semibold">{souscripteur.telephone}</p>
            </div>
            {souscripteur.email && (
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-semibold">{souscripteur.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Plantation Info */}
        {plantation && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
            <h3 className="font-bold text-amber-700 mb-2 text-lg">PLANTATION CONCERNÉE</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nom</p>
                <p className="font-semibold">{plantation.nom_plantation || plantation.id_unique}</p>
              </div>
              <div>
                <p className="text-gray-500">ID Plantation</p>
                <p className="font-semibold">{plantation.id_unique}</p>
              </div>
              <div>
                <p className="text-gray-500">Superficie</p>
                <p className="font-semibold">{plantation.superficie_ha} hectares</p>
              </div>
              <div>
                <p className="text-gray-500">Région</p>
                <p className="font-semibold">{plantation.regions?.nom || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="mb-8">
          <h3 className="font-bold text-[#00643C] mb-4 text-lg border-b-2 border-[#00643C] pb-2">
            DÉTAILS DU PAIEMENT
          </h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-3 text-gray-600">Référence transaction</td>
                <td className="py-3 font-semibold text-right">{paiement.reference || paiement.fedapay_transaction_id || 'N/A'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 text-gray-600">Type de paiement</td>
                <td className="py-3 font-semibold text-right">
                  {paiement.type_paiement === 'DA' ? "Droit d'Accès (DA)" : "Contribution mensuelle"}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 text-gray-600">Mode de paiement</td>
                <td className="py-3 font-semibold text-right">{paiement.mode_paiement || 'Mobile Money'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 text-gray-600">Date du paiement</td>
                <td className="py-3 font-semibold text-right">
                  {paiement.date_paiement 
                    ? format(new Date(paiement.date_paiement), "dd MMMM yyyy à HH:mm", { locale: fr })
                    : format(new Date(paiement.created_at || new Date()), "dd MMMM yyyy", { locale: fr })
                  }
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 text-gray-600">Statut</td>
                <td className="py-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    paiement.statut === 'valide' 
                      ? 'bg-green-100 text-green-700' 
                      : paiement.statut === 'rejete'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {paiement.statut === 'valide' ? '✓ VALIDÉ' : paiement.statut === 'rejete' ? '✗ REJETÉ' : '⏳ EN ATTENTE'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount Box */}
          <div className="mt-6 bg-gradient-to-r from-[#00643C] to-[#008F53] text-white p-6 rounded-lg text-center">
            <p className="text-sm opacity-90 mb-1">MONTANT PAYÉ</p>
            <p className="text-4xl font-bold">{formatMontant(paiement.montant_paye || paiement.montant || 0)}</p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            {/* Stamp */}
            <div className="text-center">
              <div className="inline-block border-4 border-[#00643C] rounded-full p-6 opacity-80 rotate-[-8deg]">
                <div className="text-center">
                  <p className="text-xs text-[#00643C] font-bold">AGRICAPITAL</p>
                  <p className="text-lg font-bold text-[#00643C]">PAYÉ</p>
                  <p className="text-xs text-[#00643C]">{format(dateEmission, "dd/MM/yyyy")}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Cachet officiel</p>
            </div>

            {/* DG Signature */}
            <div className="text-center">
              <div className="h-20 flex items-end justify-center">
                <div className="text-[#00643C] font-script text-3xl italic">
                  Inocent Koffi
                </div>
              </div>
              <div className="border-t border-gray-400 pt-2 mt-2">
                <p className="font-bold text-sm">KOFFI Yao Inocent</p>
                <p className="text-xs text-gray-600">Directeur Général</p>
                <p className="text-xs text-gray-500">AgriCapital</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
          <p className="mb-1">Ce reçu est généré automatiquement et fait foi de paiement.</p>
          <p className="mb-1">Pour toute réclamation, veuillez contacter notre service client au +225 05 64 55 17 17</p>
          <p className="font-semibold text-[#00643C]">Merci pour votre confiance ! 🌴</p>
        </div>

        {/* QR Code placeholder area */}
        <div className="mt-4 text-center">
          <div className="inline-block p-2 bg-gray-100 rounded">
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              QR Code
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Scannez pour vérifier</p>
        </div>
      </div>
    );
  }
);

PaymentReceipt.displayName = "PaymentReceipt";

export default PaymentReceipt;
