import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bytebridge-signature, x-bytebridge-timestamp, x-bytebridge-event-id, x-bytebridge-currency",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-bytebridge-signature") || "";
    const eventId = req.headers.get("x-bytebridge-event-id") || "";
    const currency = req.headers.get("x-bytebridge-currency") || "VES";

    if (!rawBody) {
      return new Response(JSON.stringify({ error: "Empty request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const businessName = payload.metadata?.businessName || "PinZulia Bowling";

    // 1. Fetch secret API key for business
    const { data: business } = await supabase
      .from("bytebridge_businesses")
      .select("id, api_key")
      .eq("business_name", businessName)
      .eq("is_active", true)
      .maybeSingle();

    const apiKey = business?.api_key || Deno.env.get("BYTEBRIDGE_DEFAULT_API_KEY") || "SECURE_BRIDGE_KEY_2026";

    // 2. Validate HMAC Signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signature && signature !== expectedSignature) {
      console.warn(`[ByteBridge] Invalid signature for ${businessName}`);
      return new Response(JSON.stringify({ error: "Invalid HMAC signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Ping handler
    if (payload.event === "bridge.ping") {
      return new Response(
        JSON.stringify({ status: "pong", message: "Supabase connection OK", timestamp: Date.now() }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = payload.data;
    const idempotencyKey = payload.idempotencyKey || `${data.bankCode || data.bank}:${data.reference}:${data.amount}`;

    // 4. Idempotency Check
    const { data: existingPayment } = await supabase
      .from("bytebridge_payments")
      .select("id, reference, status, reconciled_order_id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingPayment) {
      return new Response(
        JSON.stringify({
          status: "duplicate",
          message: "Pago ya registrado anteriormente",
          paymentId: existingPayment.id,
          orderId: existingPayment.reconciled_order_id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Look for matching pending order created in the WebApp
    const paymentAmount = Number(data.amount);
    const paymentCurrency = data.currency || currency;

    // Search query for pending orders of this business
    let matchedOrderId: string | null = null;

    // A. Match by Reference if user/customer entered the reference beforehand
    if (data.reference) {
      const { data: orderWithRef } = await supabase
        .from("orders")
        .select("id, total_amount")
        .eq("business_name", businessName)
        .eq("status", "PENDING")
        .ilike("payment_reference", `%${data.reference}%`)
        .maybeSingle();

      if (orderWithRef) {
        matchedOrderId = orderWithRef.id;
      }
    }

    // B. Match by Exact Amount and Customer Phone or CI
    if (!matchedOrderId && (data.payerPhone || data.payerId)) {
      let query = supabase
        .from("orders")
        .select("id, total_amount")
        .eq("business_name", businessName)
        .eq("status", "PENDING")
        .eq("currency", paymentCurrency)
        .eq("total_amount", paymentAmount);

      if (data.payerPhone) query = query.eq("customer_phone", data.payerPhone);
      else if (data.payerId) query = query.eq("customer_ci", data.payerId);

      const { data: orderWithCustomer } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (orderWithCustomer) {
        matchedOrderId = orderWithCustomer.id;
      }
    }

    // C. Match by Exact Amount on most recent pending order (within last 45 minutes)
    if (!matchedOrderId) {
      const timeThreshold = new Date(Date.now() - 45 * 60 * 1000).toISOString();
      const { data: recentOrder } = await supabase
        .from("orders")
        .select("id, total_amount")
        .eq("business_name", businessName)
        .eq("status", "PENDING")
        .eq("currency", paymentCurrency)
        .eq("total_amount", paymentAmount)
        .gte("created_at", timeThreshold)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentOrder) {
        matchedOrderId = recentOrder.id;
      }
    }

    const reconciliationStatus = matchedOrderId ? "RECONCILED" : "UNMATCHED_ORDER";

    // 6. Insert Reconciled Payment
    const { data: insertedPayment, error: insertError } = await supabase
      .from("bytebridge_payments")
      .insert({
        business_id: business?.id,
        business_name: businessName,
        event_id: eventId || payload.eventId,
        idempotency_key: idempotencyKey,
        channel: payload.channel || "PUSH",
        bank: data.bank,
        bank_code: data.bankCode,
        bank_name: data.bankName,
        reference: data.reference,
        amount: paymentAmount,
        currency: paymentCurrency,
        payer_name: data.payerName || null,
        payer_phone: data.payerPhone || null,
        payer_id: data.payerId || null,
        raw_message: data.rawMessage,
        status: reconciliationStatus,
        reconciled_order_id: matchedOrderId,
        received_at: new Date(data.receivedAt || payload.timestamp).toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[ByteBridge] Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. If an order was matched, mark it as PAID immediately
    if (matchedOrderId) {
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          status: "PAID",
          paid_at: new Date().toISOString(),
          payment_id: insertedPayment.id,
          payment_reference: data.reference,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchedOrderId);

      if (orderUpdateError) {
        console.error("[ByteBridge] Order update error:", orderUpdateError);
      } else {
        console.log(`[ByteBridge] 🎯 Orden ${matchedOrderId} acreditada con éxito para ${businessName}!`);
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: matchedOrderId
          ? "Pago acreditado a la orden correspondiente"
          : "Pago registrado en espera de asignación de orden",
        reconciled: !!matchedOrderId,
        orderId: matchedOrderId,
        paymentId: insertedPayment.id,
        received: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
