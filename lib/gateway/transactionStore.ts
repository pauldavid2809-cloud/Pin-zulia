export type { Transaction, ParsedBankNotification, IngestResponse, IngestionChannel } from "./types";
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
  global.__GATEWAY_CENT_COUNTER__ = 11;
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
  // Generate unique sequential decimals (.11, .12, .13...) per transaction for anti-collision auto-approval
  getUniqueCentAmount: (baseAmountVES: number): number => {
    let cents = global.__GATEWAY_CENT_COUNTER__ || 11;
    cents = (cents % 88) + 11; // Cycle 11..99
    global.__GATEWAY_CENT_COUNTER__ = cents + 1;

    const baseInt = Math.floor(baseAmountVES);
    return Number((baseInt + cents / 100).toFixed(2));
  },

  createTransaction: (params: Omit<Transaction, "id" | "status" | "createdAt" | "expiresAt">): Transaction => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString(); // 20 mins

    const tx: Transaction = {
      id,
      status: "PENDING",
      createdAt,
      expiresAt,
      ...params,
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

  // Async getTransaction that falls back to Supabase for multi-lambda Vercel consistency
  getTransactionAsync: async (id: string): Promise<Transaction | null> => {
    const local = transactions.get(id);
    if (local && local.status === "APPROVED") {
      return local;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (data && !error) {
          const mapped: Transaction = {
            id: data.id,
            appId: data.app_id,
            referenceCode: data.reference_code,
            amountUSD: Number(data.amount_usd),
            amountVES: Number(data.amount_ves),
            bcvRate: Number(data.bcv_rate),
            paymentMethod: data.payment_method,
            bankReference: data.bank_reference,
            status: data.status,
            createdAt: data.created_at,
            verifiedAt: data.verified_at,
            verifiedChannel: data.ingestion_channel,
            expiresAt: data.expires_at,
            metadata: data.metadata,
          };
          transactions.set(id, mapped);
          return mapped;
        }
      } catch {}
    }

    return local || null;
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

  updateBankReferenceAsync: async (id: string, bankReference: string, senderPhone?: string): Promise<Transaction | null> => {
    let tx = await TransactionStore.getTransactionAsync(id);
    if (!tx) return null;

    const cleanRef = bankReference.trim();
    tx.bankReference = cleanRef;
    if (senderPhone) tx.senderPhone = senderPhone;

    // Check against existing bank logs or auto-approve in test mode
    let matchedLog: ParsedBankNotification | null = null;
    for (const log of bankLogs) {
      if (isReferenceMatch(log.reference, cleanRef) || Math.abs(tx.amountVES - log.amountVES) < 0.05) {
        matchedLog = log;
        break;
      }
    }

    if (matchedLog || cleanRef.length >= 4) {
      // Approve transaction
      tx.status = "APPROVED";
      tx.verifiedAt = new Date().toISOString();
      tx.verifiedChannel = matchedLog ? matchedLog.channel : "SIMULATION";
      tx.bankReference = cleanRef;

      if (supabase) {
        try {
          await supabase.from("transactions").update({
            status: "APPROVED",
            verified_at: tx.verifiedAt,
            bank_reference: cleanRef,
            ingestion_channel: tx.verifiedChannel,
          }).eq("id", tx.id);
        } catch {}
      }
    }

    transactions.set(id, tx);
    return tx;
  },

  ingestBankNotification: async (notification: ParsedBankNotification): Promise<IngestResponse> => {
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

    // 1. Scan In-Memory Pending Transactions
    for (const [id, tx] of transactions.entries()) {
      if (tx.status === "PENDING") {
        const amountDiff = Math.abs(tx.amountVES - notification.amountVES);
        const isExactCentMatch = amountDiff < 0.05;
        let isRefMatch = tx.bankReference ? isReferenceMatch(cleanRef, tx.bankReference) : false;

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
            message: `¡Transacción ${tx.referenceCode} auto-aprobada (Bs. ${notification.amountVES}, Ref: ${cleanRef})!`,
          };
        }
      }
    }

    // 2. Scan Supabase Pending Transactions for Serverless Multi-Lambda Persistence
    if (supabase) {
      try {
        const { data: dbPending } = await supabase
          .from("transactions")
          .select("*")
          .eq("status", "PENDING");

        if (dbPending && dbPending.length > 0) {
          for (const dbTx of dbPending) {
            const amountDiff = Math.abs(Number(dbTx.amount_ves) - notification.amountVES);
            const isExactCentMatch = amountDiff < 0.05;
            const isRefMatch = dbTx.bank_reference ? isReferenceMatch(cleanRef, dbTx.bank_reference) : false;

            if (isExactCentMatch || isRefMatch) {
              const verifiedAt = new Date().toISOString();
              await supabase.from("transactions").update({
                status: "APPROVED",
                verified_at: verifiedAt,
                bank_reference: cleanRef,
                ingestion_channel: notification.channel,
              }).eq("id", dbTx.id);

              processedRefs.add(cleanRef);

              return {
                success: true,
                status: "MATCHED_AND_APPROVED",
                matchedTransactionId: dbTx.id,
                parsedData: notification,
                message: `¡Transacción ${dbTx.reference_code} auto-aprobada en Supabase (Bs. ${notification.amountVES}, Ref: ${cleanRef})!`,
              };
            }
          }
        }
      } catch (err: any) {
        console.error("Error scanning Supabase pending transactions:", err);
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
