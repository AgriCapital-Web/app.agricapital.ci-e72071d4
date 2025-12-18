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
    if (!secretKey) {
      throw new Error('FEDAPAY_SECRET_KEY not configured');
    }

    const { amount, description, reference, customer, callback_url } = await req.json();

    console.log('Creating FedaPay transaction:', { amount, description, reference });

    // Determine environment (sandbox or live)
    const isSandbox = secretKey.startsWith('sk_sandbox_');
    const baseUrl = isSandbox 
      ? 'https://sandbox-api.fedapay.com' 
      : 'https://api.fedapay.com';

    // Create transaction
    const response = await fetch(`${baseUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
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
    console.log('FedaPay response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create transaction');
    }

    // Generate payment token/URL
    const tokenResponse = await fetch(`${baseUrl}/v1/transactions/${data.v1.transaction.id}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', JSON.stringify(tokenData, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        transaction: data.v1.transaction,
        token: tokenData.token,
        payment_url: tokenData.url
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
