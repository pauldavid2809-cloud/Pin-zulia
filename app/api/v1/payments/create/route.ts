import { NextResponse } from "next/server";
import { TransactionStore } from "@/lib/gateway/transactionStore";
import { PAYMENT_ACCOUNTS } from "@/data/pinzuliaData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amountUSD,
      referenceCode,
      paymentMethod = "pago_movil",
      appId = "pinzulia",
      metadata = {},
    } = body;

    if (!amountUSD || amountUSD <= 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    // Fetch live BCV rate from our DolarAPI endpoint
    let bcvRate = 791.67;
    try {
      const bcvRes = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
        next: { revalidate: 300 },
      });
      if (bcvRes.ok) {
        const bcvData = await bcvRes.json();
        if (bcvData.promedio) bcvRate = Number(bcvData.promedio);
      }
    } catch {}

    const amountVES = Number((amountUSD * bcvRate).toFixed(2));

    const tx = TransactionStore.createTransaction({
      appId,
      referenceCode: referenceCode || `ORD-${Date.now().toString().slice(-4)}`,
      amountUSD: Number(amountUSD.toFixed(2)),
      amountVES,
      bcvRate: Number(bcvRate.toFixed(2)),
      paymentMethod,
      metadata,
    });

    return NextResponse.json({
      success: true,
      transaction: tx,
      paymentInstructions: {
        pagoMovil: {
          banco: PAYMENT_ACCOUNTS.pagoMovil.banco,
          telefono: PAYMENT_ACCOUNTS.pagoMovil.telefono,
          rif: PAYMENT_ACCOUNTS.pagoMovil.rif,
          titular: PAYMENT_ACCOUNTS.pagoMovil.titular,
          exactAmountVES: amountVES,
        },
        zelle: PAYMENT_ACCOUNTS.zelle,
        binance: PAYMENT_ACCOUNTS.binance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al crear transacción" }, { status: 500 });
  }
}