export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

export type PaymentMethod = "pago_movil" | "c2p" | "zelle" | "binance" | "efectivo";

export type IngestionChannel = "SMS" | "EMAIL" | "PUSH" | "SIMULATION";

export interface Transaction {
  id: string; // e.g. "tx_9841029482"
  appId: string; // e.g. "pinzulia" or "the-corner"
  referenceCode: string; // e.g. "PIN-501" or "CMD-401"
  amountUSD: number;
  amountVES: number;
  bcvRate: number;
  paymentMethod: PaymentMethod;
  bankReference?: string; // e.g. "849201" (submitted by user or parsed from SMS/Email/Push)
  senderPhone?: string;
  senderId?: string;
  status: PaymentStatus;
  createdAt: string;
  verifiedAt?: string;
  verifiedChannel?: IngestionChannel;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export interface ParsedBankNotification {
  bank: string;
  rawText: string;
  amountVES: number;
  reference: string;
  senderPhone?: string;
  timestamp: string;
  channel: IngestionChannel;
}

export interface IngestResponse {
  success: boolean;
  status: "MATCHED_AND_APPROVED" | "UNMATCHED_LOGGED" | "ALREADY_PROCESSED" | "PARSE_ERROR";
  matchedTransactionId?: string;
  parsedData?: ParsedBankNotification;
  message?: string;
}