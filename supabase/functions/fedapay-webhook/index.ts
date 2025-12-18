import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-fedapay-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('FedaPay Webhook received:', JSON.stringify(body, null, 2));

    const { event, entity } = body;

    // Verify webhook signature if secret is configured
    const signature = req.headers.get('x-fedapay-signature');
    if (webhookSecret && signature) {
      // TODO: Implement signature verification
      console.log('Webhook signature present:', signature);
    }

    // Handle different event types
    switch (event) {
      case 'transaction.approved':
      case 'transaction.completed': {
        const transactionId = entity?.id?.toString();
        const reference = entity?.reference || entity?.custom_metadata?.reference;
        
        console.log(`Processing approved/completed transaction: ${transactionId}, reference: ${reference}`);

        if (reference) {
          // Update payment status
          const { data, error } = await supabase
            .from('paiements')
            .update({
              statut: 'valide',
              fedapay_transaction_id: transactionId,
              date_paiement: new Date().toISOString(),
              metadata: {
                ...entity,
                webhook_received_at: new Date().toISOString()
              }
            })
            .eq('reference', reference)
            .select();

          if (error) {
            console.error('Error updating payment:', error);
            throw error;
          }

          console.log('Payment updated successfully:', data);
        }
        break;
      }

      case 'transaction.declined':
      case 'transaction.failed':
      case 'transaction.cancelled': {
        const transactionId = entity?.id?.toString();
        const reference = entity?.reference || entity?.custom_metadata?.reference;
        
        console.log(`Processing failed/declined transaction: ${transactionId}`);

        if (reference) {
          const { error } = await supabase
            .from('paiements')
            .update({
              statut: 'echec',
              fedapay_transaction_id: transactionId,
              metadata: {
                ...entity,
                failure_reason: entity?.reason || event,
                webhook_received_at: new Date().toISOString()
              }
            })
            .eq('reference', reference);

          if (error) {
            console.error('Error updating failed payment:', error);
            throw error;
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return new Response(
      JSON.stringify({ success: true, event }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    console.error('Webhook error:', error);
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
