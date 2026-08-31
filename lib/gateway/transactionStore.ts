import { Transaction, ParsedBankNotification, IngestResponse } from "./types";

declare global {
  var __GATEWAY_TRANSACTIONS__: Map<string, Transaction> | undefined;
  var __GATEWAY_BANK_LOGS__: ParsedBankNotification[] | undefined;
  var __GATEWAY_PROCESSED_REFS__: Set<string> | undefined;
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
    return tx;
  },

  getTransaction: (id: string): Transaction | null => {
    return transactions.get(id) || null;
  },

  getAllTransactions: (): Transaction[] => {
    return Array.from(transactions.values()).reverse();
  },

  // Customer submits their reference: Check if ByteBridge already captured it!
  updateBankReference: (id: string, bankReference: string, senderPhone?: string): Transaction | null => {
    const tx = transactions.get(id);
    if (!tx) return null;

    tx.bankReference = bankReference.trim();
    if (senderPhone) tx.senderPhone = senderPhone;

    // Scan existing bank logs (in case push arrived before customer typed reference)
    if (tx.status === "PENDING") {
      for (const log of bankLogs) {
        const isMatch = isReferenceMatch(log.reference, tx.bankReference);
        const amountDiff = Math.abs(tx.amountVES - log.amountVES);
        const isAmountMatch = amountDiff <= 2.0;

        if (isMatch && isAmountMatch) {
          tx.status = "APPROVED";
          tx.verifiedAt = new Date().toISOString();
          tx.verifiedChannel = log.channel;
          tx.bankReference = log.reference;
          if (log.senderPhone) tx.senderPhone = log.senderPhone;
          transactions.set(id, tx);
          processedRefs.add(log.reference);
          break;
        }
      }
    }

    transactions.set(id, tx);
    return tx;
  },

  // ByteBridge Push Ingestion with STRICT Reference Matching
  ingestBankNotification: (notification: ParsedBankNotification): IngestResponse => {
    bankLogs.unshift(notification);
    if (bankLogs.length > 80) bankLogs.pop();

    const cleanRef = notification.reference.trim();

    // 1. Idempotency Check: Was this exact reference already processed?
    if (processedRefs.has(cleanRef)) {
      return {
        success: true,
        status: "ALREADY_PROCESSED",
        parsedData: notification,
        message: `Notificación duplicada [Canal: ${notification.channel}] recibida para referencia ya verificada (${cleanRef}). Descartada con éxito.`,
      };
    }

    // 2. Scan Pending Transactions: STRICT MATCH (Customer MUST provide reference)
    for (const [id, tx] of transactions.entries()) {
      if (tx.status === "PENDING" && tx.bankReference) {
        const isRefMatch = isReferenceMatch(cleanRef, tx.bankReference);
        const amountDiff = Math.abs(tx.amountVES - notification.amountVES);
        const isAmountMatch = amountDiff <= 2.0;

        if (isRefMatch && isAmountMatch) {
          tx.status = "APPROVED";
          tx.verifiedAt = new Date().toISOString();
          tx.verifiedChannel = notification.channel;
          tx.bankReference = cleanRef;
          if (notification.senderPhone) tx.senderPhone = notification.senderPhone;
          transactions.set(id, tx);

          processedRefs.add(cleanRef);

          return {
            success: true,
            status: "MATCHED_AND_APPROVED",
            matchedTransactionId: tx.id,
            parsedData: notification,
            message: `¡Transacción ${tx.referenceCode} aprobada por ${notification.channel} (${notification.bank}, Ref: ${cleanRef})!`,
          };
        }
      }
    }

    return {
      success: true,
      status: "UNMATCHED_LOGGED",
      parsedData: notification,
      message: `Pago [${notification.channel}] registrado en auditoría (Ref: ${cleanRef}, Bs. ${notification.amountVES}). Esperando que el cliente ingrese su referencia.`,
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
