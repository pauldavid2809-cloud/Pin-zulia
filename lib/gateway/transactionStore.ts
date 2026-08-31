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

  updateBankReference: (id: string, bankReference: string, senderPhone?: string): Transaction | null => {
    const tx = transactions.get(id);
    if (!tx) return null;
    tx.bankReference = bankReference;
    if (senderPhone) tx.senderPhone = senderPhone;
    transactions.set(id, tx);
    return tx;
  },

  // Multi-Channel Ingestion & Deduplication Algorithm
  ingestBankNotification: (notification: ParsedBankNotification): IngestResponse => {
    bankLogs.unshift(notification);
    if (bankLogs.length > 80) bankLogs.pop();

    const cleanRef = notification.reference.trim();
    const lastDigits = cleanRef.slice(-6);

    // 1. Idempotency Check: Was this exact reference already processed by another channel?
    if (processedRefs.has(cleanRef)) {
      return {
        success: true,
        status: "ALREADY_PROCESSED",
        parsedData: notification,
        message: `Notificación duplicada [Canal: ${notification.channel}] recibida para referencia ya verificada (${cleanRef}). Descartada con éxito.`,
      };
    }

    // 2. Scan Pending Transactions for Match
    for (const [id, tx] of transactions.entries()) {
      if (tx.status === "PENDING") {
        const amountDiff = Math.abs(tx.amountVES - notification.amountVES);
        const isAmountMatch = amountDiff <= 2.0;

        let isRefMatch = false;
        if (tx.bankReference) {
          const userRef = tx.bankReference.trim();
          isRefMatch =
            cleanRef.endsWith(userRef) ||
            userRef.endsWith(cleanRef) ||
            userRef.slice(-6) === lastDigits ||
            cleanRef === userRef;
        } else {
          // Time-window matching (within 5 min of transaction creation)
          const ageMs = Date.now() - new Date(tx.createdAt).getTime();
          if (ageMs < 5 * 60 * 1000 && amountDiff < 0.1) {
            isRefMatch = true;
          }
        }

        if (isAmountMatch && isRefMatch) {
          tx.status = "APPROVED";
          tx.verifiedAt = new Date().toISOString();
          tx.verifiedChannel = notification.channel;
          tx.bankReference = cleanRef;
          if (notification.senderPhone) tx.senderPhone = notification.senderPhone;
          transactions.set(id, tx);

          // Mark reference as processed in deduplication set
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
      message: `Pago [Canal: ${notification.channel}] registrado en auditoría (Ref: ${cleanRef}, Bs. ${notification.amountVES}), esperando orden de cliente.`,
    };
  },

  getBankLogs: (): ParsedBankNotification[] => {
    return bankLogs;
  },
};