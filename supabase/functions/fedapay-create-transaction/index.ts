import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secretKey = Deno.env.get('FEDAPAY_SECRET_KEY');
    console.log('FedaPay Secret Key exists:', !!secretKey);
    console.log('FedaPay Secret Key prefix:', secretKey?.substring(0, 15) + '...');
    
    if (!secretKey) {
      throw new Error('FEDAPAY_SECRET_KEY not configured. Veuillez configurer votre clé API FedaPay dans les secrets.');
    }

    // Vérifier le format de la clé
    if (!secretKey.startsWith('sk_sandbox_') && !secretKey.startsWith('sk_live_')) {
      throw new Error('Format de clé FedaPay invalide. La clé doit commencer par sk_sandbox_ ou sk_live_');
    }

    const { amount, description, reference, customer, callback_url } = await req.json();

    console.log('Creating FedaPay transaction:', { amount, description, reference, callback_url });

    // Determine environment (sandbox or live)
    const isSandbox = secretKey.startsWith('sk_sandbox_');
    const baseUrl = isSandbox 
      ? 'https://sandbox-api.fedapay.com' 
      : 'https://api.fedapay.com';

    console.log('Using FedaPay environment:', isSandbox ? 'SANDBOX' : 'LIVE');
    console.log('API URL:', baseUrl);

    // Create transaction
    const response = await fetch(`${baseUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        reference,
        merchant_reference: reference,
        amount: Math.round(amount),
        currency: { iso: 'XOF' },
        callback_url,
        customer: {
          firstname: customer?.firstname || 'Client',
          lastname: customer?.lastname || 'AgriCapital',
          email: customer?.email || 'client@agricapital.ci',
          phone_number: {
            number: customer?.phone || '',
            country: 'CI'
          }
        },
        custom_metadata: {
          reference
        }
      }),
    });

    const data = await response.json();
    console.log('FedaPay response status:', response.status);
    console.log('FedaPay response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      if (data?.message === "Erreur d'authentification.") {
        throw new Error("Clé API FedaPay invalide ou expirée. Veuillez vérifier votre clé secrète dans les paramètres.");
      }
      throw new Error(data?.message || 'Failed to create transaction');
    }

    // FedaPay can return different shapes depending on API version:
    // - { "id": ... }
    // - { "v1/transaction": { id, payment_url, ... } }
    const transaction = (data && (data["v1/transaction"] ?? data.v1?.transaction ?? data.transaction ?? data)) as any;
    const transactionId = transaction?.id;

    // Some FedaPay responses already include payment_url + payment_token.
    if (transaction?.payment_url) {
      return new Response(
        JSON.stringify({
          success: true,
          transaction,
          token: transaction?.payment_token,
          payment_url: transaction?.payment_url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (!transactionId) {
      throw new Error('Réponse FedaPay inattendue: id de transaction manquant');
    }

    // Otherwise, generate payment token/URL
    const tokenResponse = await fetch(`${baseUrl}/v1/transactions/${transactionId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response:', JSON.stringify(tokenData, null, 2));

    if (!tokenResponse.ok) {
      throw new Error(tokenData?.message || 'Failed to create payment token');
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        token: tokenData?.token,
        payment_url: tokenData?.url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    console.error('Error creating transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
