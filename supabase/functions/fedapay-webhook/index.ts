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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('FedaPay Webhook received:', JSON.stringify(body, null, 2));

    const { event, entity } = body;
    const transactionId = entity?.id?.toString();
    const reference = entity?.reference || entity?.custom_metadata?.reference;

    // Store event in fedapay_events table
    const { data: eventRecord, error: eventError } = await supabase
      .from('fedapay_events')
      .insert({
        event_id: body?.id?.toString(),
        event_type: event,
        transaction_id: transactionId,
        transaction_reference: reference,
        status: entity?.status,
        amount: entity?.amount,
        customer_email: entity?.customer?.email,
        customer_phone: entity?.customer?.phone_number?.number,
        raw_payload: body,
        processed: false
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error storing event:', eventError);
    } else {
      console.log('Event stored:', eventRecord?.id);
    }

    // Handle different event types
    let paiementUpdated = false;
    
    switch (event) {
      case 'transaction.approved':
      case 'transaction.completed': {
        console.log(`Processing approved/completed transaction: ${transactionId}, reference: ${reference}`);

        if (reference) {
          // Update payment status
          const { data, error } = await supabase
            .from('paiements')
            .update({
              statut: 'valide',
              fedapay_transaction_id: transactionId,
              fedapay_reference: entity?.reference,
              montant_paye: entity?.amount,
              date_paiement: new Date().toISOString(),
              metadata: {
                fedapay_entity: entity,
                webhook_event: event,
                webhook_received_at: new Date().toISOString()
              }
            })
            .eq('reference', reference)
            .select()
            .single();

          if (error) {
            console.error('Error updating payment:', error);
          } else {
            console.log('Payment updated successfully:', data?.id);
            paiementUpdated = true;
            
            // Link event to paiement
            if (eventRecord?.id && data?.id) {
              await supabase
                .from('fedapay_events')
                .update({ paiement_id: data.id, processed: true, processed_at: new Date().toISOString() })
                .eq('id', eventRecord.id);
            }

            // If DA payment, update plantation superficie_activee
            if (data?.type_paiement === 'DA' && data?.plantation_id) {
              const { data: plantation } = await supabase
                .from('plantations')
                .select('superficie_ha, superficie_activee, montant_da')
                .eq('id', data.plantation_id)
                .single();

              if (plantation) {
                const montantDA = plantation.montant_da || 30000;
                const superficiePayee = (data.montant_paye || data.montant) / montantDA;
                const nouvelleSuperficie = Math.min(
                  plantation.superficie_ha,
                  (plantation.superficie_activee || 0) + superficiePayee
                );

                await supabase
                  .from('plantations')
                  .update({
                    superficie_activee: nouvelleSuperficie,
                    date_activation: plantation.superficie_activee === 0 ? new Date().toISOString() : undefined,
                    statut_global: nouvelleSuperficie >= plantation.superficie_ha ? 'actif' : 'da_partiel'
                  })
                  .eq('id', data.plantation_id);

                console.log(`Plantation ${data.plantation_id} updated: superficie_activee = ${nouvelleSuperficie}`);
              }
            }
          }
        }
        break;
      }

      case 'transaction.declined':
      case 'transaction.failed':
      case 'transaction.cancelled': {
        console.log(`Processing failed/declined transaction: ${transactionId}`);

        if (reference) {
          const { data, error } = await supabase
            .from('paiements')
            .update({
              statut: 'echec',
              fedapay_transaction_id: transactionId,
              fedapay_reference: entity?.reference,
              metadata: {
                fedapay_entity: entity,
                failure_reason: entity?.last_error_code || event,
                webhook_event: event,
                webhook_received_at: new Date().toISOString()
              }
            })
            .eq('reference', reference)
            .select()
            .single();

          if (error) {
            console.error('Error updating failed payment:', error);
          } else {
            paiementUpdated = true;
            if (eventRecord?.id && data?.id) {
              await supabase
                .from('fedapay_events')
                .update({ paiement_id: data.id, processed: true, processed_at: new Date().toISOString() })
                .eq('id', eventRecord.id);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return new Response(
      JSON.stringify({ success: true, event, paiementUpdated }),
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
