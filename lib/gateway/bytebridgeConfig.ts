import crypto from "crypto";

export const BYTEBRIDGE_DEFAULT_SECRET = "bb_sec_pinzulia_2026_98a7b6c5d4e3";

declare global {
  var __BYTEBRIDGE_ACTIVE_KEY__: string | undefined;
}

if (!global.__BYTEBRIDGE_ACTIVE_KEY__) {
  global.__BYTEBRIDGE_ACTIVE_KEY__ = process.env.BYTEBRIDGE_API_KEY || BYTEBRIDGE_DEFAULT_SECRET;
}

export class ByteBridgeManager {
  /**
   * Returns current active HMAC API Key
   */
  static getApiKey(): string {
    return global.__BYTEBRIDGE_ACTIVE_KEY__ || BYTEBRIDGE_DEFAULT_SECRET;
  }

  /**
   * Regenerates a new secure HMAC API Key
   */
  static regenerateApiKey(): string {
    const newKey = `bb_sec_${crypto.randomBytes(16).toString("hex")}`;
    global.__BYTEBRIDGE_ACTIVE_KEY__ = newKey;
    return newKey;
  }

  /**
   * Computes HMAC-SHA256 signature for a raw payload string
   */
  static generateSignature(rawBody: string, apiKey?: string): string {
    const key = apiKey || this.getApiKey();
    return crypto.createHmac("sha256", key).update(rawBody).digest("hex");
  }

  /**
   * Verifies the X-ByteBridge-Signature header
   */
  static verifySignature(rawBody: string, incomingSignature: string | null): boolean {
    if (!incomingSignature) return false;
    const expected = this.generateSignature(rawBody, this.getApiKey());
    
    // Constant-time buffer comparison to prevent timing attacks
    try {
      const a = Buffer.from(incomingSignature.trim(), "utf8");
      const b = Buffer.from(expected.trim(), "utf8");
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Generates the pairing JSON structure for ByteBridge Android App
   */
  static getPairingConfig(originUrl: string = "http://localhost:3000") {
    return {
      businessName: "PinZulia Bowling Boutique & Gastropub",
      webhookUrl: `${originUrl.replace(/\/+$/, "")}/api/v1/ingest/push`,
      apiKey: this.getApiKey(),
      isActive: true,
      supportedChannels: ["PUSH", "SMS", "ZELLE_EMAIL"],
      pairedAt: new Date().toISOString(),
    };
  }
}
