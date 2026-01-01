import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secretKey = Deno.env.get("FEDAPAY_SECRET_KEY");
    if (!secretKey) {
      throw new Error(
        "FEDAPAY_SECRET_KEY not configured. Veuillez configurer votre clé API FedaPay dans les secrets."
      );
    }

    const { transactionId } = await req.json();
    if (!transactionId) {
      return new Response(JSON.stringify({ error: "transactionId manquant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSandbox = secretKey.startsWith("sk_sandbox_");
    const baseUrl = isSandbox ? "https://sandbox-api.fedapay.com" : "https://api.fedapay.com";

    console.log("Verify transaction:", { transactionId, env: isSandbox ? "SANDBOX" : "LIVE" });

    const resp = await fetch(`${baseUrl}/v1/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await resp.json();
    console.log("Verify response status:", resp.status);

    if (!resp.ok) {
      throw new Error(data?.message || "Failed to verify transaction");
    }

    // Normalize shapes
    const transaction = (data && (data["v1/transaction"] ?? data.v1?.transaction ?? data.transaction ?? data)) as any;

    return new Response(JSON.stringify({ success: true, transaction }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error verifying transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
