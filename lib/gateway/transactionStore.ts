import { Transaction, ParsedBankNotification, IngestResponse } from "./types";
import { supabase } from "@/lib/supabaseClient";

declare global {
  var __GATEWAY_TRANSACTIONS__: Map<string, Transaction> | undefined;
  var __GATEWAY_BANK_LOGS__: ParsedBankNotification[] | undefined;
  var __GATEWAY_PROCESSED_REFS__: Set<string> | undefined;
  var __GATEWAY_CENT_COUNTER__: number | undefined;
}

if (!global.__GATEWAY_TRANSACTIONS__) {
  global.__GATEWAY_TRANSACTIONS__ = new Map<string, Transaction>();
}
if (!global.__GATEWAY_BANK_LOGS__) {
  global.__GATEWAY_BANK_LOGS__ = [];
}
if (!global.__GATEWAY_PROCESSED_REFS__) {
  global.__GATEWAY_PROCESSED_REFS__ = new Set<string>();
}
if (global.__GATEWAY_CENT_COUNTER__ === undefined) {
  global.__GATEWAY_CENT_COUNTER__ = 1;
}

const transactions = global.__GATEWAY_TRANSACTIONS__;
const bankLogs = global.__GATEWAY_BANK_LOGS__;
const processedRefs = global.__GATEWAY_PROCESSED_REFS__;

function isReferenceMatch(bankRef: string, userRef: string): boolean {
  const b = bankRef.trim().toLowerCase();
  const u = userRef.trim().toLowerCase();
  if (!b || !u) return false;

  return (
    b === u ||
    b.endsWith(u) ||
    u.endsWith(b) ||
    b.includes(u) ||
    u.includes(b)
  );
}

export const TransactionStore = {
  getUniqueCentAmount: (baseVES: number): number => {
    const cent = (global.__GATEWAY_CENT_COUNTER__! % 89) + 11; // 0.11 to 0.99
    global.__GATEWAY_CENT_COUNTER__ = (global.__GATEWAY_CENT_COUNTER__! + 1) % 89;
    const integerPart = Math.floor(baseVES);
    return Number((integerPart + cent / 100).toFixed(2));
  },

  createTransaction: (data: Omit<Transaction, "id" | "status" | "createdAt" | "expiresAt">): Transaction => {
    const id = `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const tx: Transaction = {
      ...data,
      id,
      status: "PENDING",
      createdAt: now.toISOString(),
      expiresAt,
    };

    transactions.set(id, tx);

    // Async persist to Supabase if configured
    if (supabase) {
      supabase.from("transactions").insert({
        id: tx.id,
        app_id: tx.appId,
        reference_code: tx.referenceCode,
        amount_usd: tx.amountUSD,
        amount_ves: tx.amountVES,
        bcv_rate: tx.bcvRate,
        payment_method: tx.paymentMethod,
        status: tx.status,
        created_at: tx.createdAt,
        expires_at: tx.expiresAt,
        metadata: tx.metadata || {},
      }).then(() => {}, () => {});
    }

    return tx;
  },

  getTransaction: (id: string): Transaction | null => {
    return transactions.get(id) || null;
  },

  getAllTransactions: (): Transaction[] => {
    return Array.from(transactions.values()).reverse();
  },

  updateBankReference: (id: string, bankReference: string, senderPhone?: string): Transaction | null => {
    const tx = transactions.get(id);
    if (!tx) return null;

    tx.bankReference = bankReference.trim();
    if (senderPhone) tx.senderPhone = senderPhone;

    // Scan bank logs for immediate match
    if (tx.status === "PENDING") {
      for (const log of bankLogs) {
        const isRefOk = isReferenceMatch(log.reference, tx.bankReference);
        const amountDiff = Math.abs(tx.amountVES - log.amountVES);
        const isAmountOk = amountDiff < 0.05;

        if (isRefOk || isAmountOk) {
          tx.status = "APPROVED";
          tx.verifiedAt = new Date().toISOString();
          tx.verifiedChannel = log.channel;
          tx.bankReference = log.reference;
          if (log.senderPhone) tx.senderPhone = log.senderPhone;
          transactions.set(id, tx);
          processedRefs.add(log.reference);

          if (supabase) {
            supabase.from("transactions").update({
              status: "APPROVED",
              verified_at: tx.verifiedAt,
              bank_reference: log.reference,
              ingestion_channel: log.channel,
            }).eq("id", tx.id).then(() => {}, () => {});
          }
          break;
        }
      }
    }

    transactions.set(id, tx);
    return tx;
  },

  ingestBankNotification: (notification: ParsedBankNotification): IngestResponse => {
    bankLogs.unshift(notification);
    if (bankLogs.length > 80) bankLogs.pop();

    const cleanRef = notification.reference.trim();

    if (processedRefs.has(cleanRef)) {
      return {
        success: true,
        status: "ALREADY_PROCESSED",
        parsedData: notification,
        message: `Notificación duplicada [Canal: ${notification.channel}] para referencia (${cleanRef}).`,
      };
    }

    // Persist notification to Supabase
    if (supabase) {
      supabase.from("bank_notifications").insert({
        bank: notification.bank,
        reference: cleanRef,
        amount_ves: notification.amountVES,
        channel: notification.channel,
        raw_payload: notification.rawText || "",
        is_processed: false,
      }).then(() => {}, () => {});
    }

    // Scan Pending Transactions by EXACT UNIQUE DECIMAL AMOUNT or REFERENCE
    for (const [id, tx] of transactions.entries()) {
      if (tx.status === "PENDING") {
        const amountDiff = Math.abs(tx.amountVES - notification.amountVES);
        const isExactCentMatch = amountDiff < 0.05; // Exact unique decimal match!

        let isRefMatch = false;
        if (tx.bankReference) {
          isRefMatch = isReferenceMatch(cleanRef, tx.bankReference);
        }

        if (isExactCentMatch || isRefMatch) {
          tx.status = "APPROVED";
          tx.verifiedAt = new Date().toISOString();
          tx.verifiedChannel = notification.channel;
          tx.bankReference = cleanRef;
          if (notification.senderPhone) tx.senderPhone = notification.senderPhone;
          transactions.set(id, tx);

          processedRefs.add(cleanRef);

          if (supabase) {
            supabase.from("transactions").update({
              status: "APPROVED",
              verified_at: tx.verifiedAt,
              bank_reference: cleanRef,
              ingestion_channel: notification.channel,
            }).eq("id", tx.id).then(() => {}, () => {});
          }

          return {
            success: true,
            status: "MATCHED_AND_APPROVED",
            matchedTransactionId: tx.id,
            parsedData: notification,
            message: `¡Transacción ${tx.referenceCode} auto-aprobada por céntimos únicos (Bs. ${notification.amountVES}, Ref: ${cleanRef})!`,
          };
        }
      }
    }

    return {
      success: true,
      status: "UNMATCHED_LOGGED",
      parsedData: notification,
      message: `Pago registrado en auditoría (Ref: ${cleanRef}, Bs. ${notification.amountVES}).`,
    };
  },

  getBankLogs: (): ParsedBankNotification[] => {
    return bankLogs;
  },

  resetLogs: () => {
    bankLogs.length = 0;
    processedRefs.clear();
  },
};
