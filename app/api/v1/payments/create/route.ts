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

    const safeAmountUSD = (!amountUSD || amountUSD <= 0) ? 1.0 : Number(amountUSD);
    
    // Dynamic Cents: Generates unique decimals (e.g. Bs. 1.12, Bs. 1.13, Bs. 1.14...)
    const baseVES = 1.00; // Base 1 Bolívar test
    const exactAmountVES = TransactionStore.getUniqueCentAmount(baseVES);

    const tx = TransactionStore.createTransaction({
      appId,
      referenceCode: referenceCode || `ORD-${Date.now().toString().slice(-4)}`,
      amountUSD: safeAmountUSD,
      amountVES: exactAmountVES,
      bcvRate: 791.67,
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
          exactAmountVES: exactAmountVES,
        },
        zelle: PAYMENT_ACCOUNTS.zelle,
        binance: PAYMENT_ACCOUNTS.binance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al crear transacción" }, { status: 500 });
  }
}
