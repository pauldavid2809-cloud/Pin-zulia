import { NextResponse } from "next/server";
import { TransactionStore } from "@/lib/gateway/transactionStore";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Props) {
  const resolved = await params;
  const tx = TransactionStore.getTransaction(resolved.id);

  if (!tx) {
    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    id: tx.id,
    status: tx.status,
    amountUSD: tx.amountUSD,
    amountVES: tx.amountVES,
    bankReference: tx.bankReference || null,
    verifiedAt: tx.verifiedAt || null,
    referenceCode: tx.referenceCode,
  });
}

export async function POST(req: Request, { params }: Props) {
  const resolved = await params;
  const body = await req.json();
  const { bankReference, senderPhone } = body;

  if (!bankReference) {
    return NextResponse.json({ error: "Referencia requerida" }, { status: 400 });
  }

  const tx = TransactionStore.updateBankReference(resolved.id, bankReference, senderPhone);
  if (!tx) {
    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    transaction: tx,
  });
}