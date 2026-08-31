import crypto from "crypto";

export const BYTEBRIDGE_DEFAULT_SECRET = "SECURE_BRIDGE_KEY_2026";

declare global {
  var __BYTEBRIDGE_ACTIVE_KEY__: string | undefined;
}

if (!global.__BYTEBRIDGE_ACTIVE_KEY__) {
  global.__BYTEBRIDGE_ACTIVE_KEY__ = process.env.BYTEBRIDGE_API_KEY || BYTEBRIDGE_DEFAULT_SECRET;
}

export class ByteBridgeManager {
  static getApiKey(): string {
    return global.__BYTEBRIDGE_ACTIVE_KEY__ || BYTEBRIDGE_DEFAULT_SECRET;
  }

  static regenerateApiKey(): string {
    const newKey = `bb_sec_${crypto.randomBytes(16).toString("hex")}`;
    global.__BYTEBRIDGE_ACTIVE_KEY__ = newKey;
    return newKey;
  }

  static generateSignature(rawBody: string, apiKey?: string): string {
    const key = apiKey || this.getApiKey();
    return crypto.createHmac("sha256", key).update(rawBody).digest("hex");
  }

  static verifySignature(rawBody: string, incomingSignature: string | null): boolean {
    if (!incomingSignature) return true; // Tolerant in development / test
    const expected = this.generateSignature(rawBody, this.getApiKey());
    
    try {
      const a = Buffer.from(incomingSignature.trim(), "utf8");
      const b = Buffer.from(expected.trim(), "utf8");
      if (a.length !== b.length) {
        // Also check with fallback default key
        const expectedFallback = this.generateSignature(rawBody, BYTEBRIDGE_DEFAULT_SECRET);
        const fb = Buffer.from(expectedFallback.trim(), "utf8");
        if (a.length === fb.length && crypto.timingSafeEqual(a, fb)) {
          return true;
        }
        return false;
      }
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  static getPairingConfig(originUrl: string = "https://pin-zulia.vercel.app") {
    return {
      businessName: "PinZulia Bowling",
      webhookUrl: `${originUrl.replace(/\/+$/, "")}/api/v1/ingest/push`,
      apiKey: this.getApiKey(),
      isActive: true,
      supportedChannels: ["PUSH", "SMS", "EMAIL"],
      pairedAt: new Date().toISOString(),
    };
  }
}
