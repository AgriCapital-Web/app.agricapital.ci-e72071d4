import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-fedapay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== FedaPay Webhook Received ===');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('Event:', body.event || body.name);

    const event = body.event || body.name;
    const entity = body.entity || body.object || body;
    const transactionId = entity?.id?.toString();
    const reference = entity?.reference || entity?.custom_metadata?.reference;

    // Store event
    const { data: eventRecord } = await supabase
      .from('fedapay_events')
      .insert({
        event_id: body?.id?.toString() || `evt_${Date.now()}`,
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

    const isApproved = event === 'transaction.approved' || event === 'transaction.completed';
    const isFailed = event === 'transaction.declined' || event === 'transaction.failed';

    if (reference && (isApproved || isFailed)) {
      const { data, error } = await supabase
        .from('paiements')
        .update({
          statut: isApproved ? 'valide' : 'echec',
          fedapay_transaction_id: transactionId,
          montant_paye: isApproved ? entity?.amount : undefined,
          date_paiement: isApproved ? new Date().toISOString() : undefined
        })
        .eq('reference', reference)
        .select('*, plantations(*)')
        .single();

      if (!error && data) {
        console.log('Payment updated:', data.id);
        
        if (eventRecord?.id) {
          await supabase.from('fedapay_events')
            .update({ paiement_id: data.id, processed: true, processed_at: new Date().toISOString() })
            .eq('id', eventRecord.id);
        }

        if (isApproved && data.type_paiement === 'DA' && data.plantations) {
          const p = data.plantations;
          const superficiePayee = (data.montant_paye || data.montant) / (p.montant_da || 30000);
          const nouvelle = Math.min(p.superficie_ha, (p.superficie_activee || 0) + superficiePayee);

          await supabase.from('plantations').update({
            superficie_activee: nouvelle,
            date_activation: p.superficie_activee === 0 ? new Date().toISOString() : undefined,
            statut_global: nouvelle >= p.superficie_ha ? 'actif' : 'da_partiel'
          }).eq('id', p.id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 
    });
  }
});
