import { NextResponse } from "next/server";
import { TransactionStore } from "@/lib/gateway/transactionStore";
import { PAYMENT_ACCOUNTS } from "@/data/pinzuliaData";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const {
      amountUSD = 1.0,
      referenceCode,
      paymentMethod = "pago_movil",
      appId = "pinzulia",
      metadata = {},
    } = body;

    // In 1 Bolívar Test Mode: always 1.00 VES
    const safeAmountUSD = (!amountUSD || amountUSD <= 0) ? 1.0 : Number(amountUSD);
    const amountVES = 1.00;
    const bcvRate = 791.67;

    const tx = TransactionStore.createTransaction({
      appId,
      referenceCode: referenceCode || `ORD-${Date.now().toString().slice(-4)}`,
      amountUSD: safeAmountUSD,
      amountVES,
      bcvRate,
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
          exactAmountVES: 1.00,
        },
        zelle: PAYMENT_ACCOUNTS.zelle,
        binance: PAYMENT_ACCOUNTS.binance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al crear transacción" }, { status: 500 });
  }
}
