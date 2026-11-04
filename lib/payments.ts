/**
 * Payment architecture.
 *
 * Online payments are intentionally NOT live: no merchant credentials have been
 * issued. Nothing here marks an order as paid. When a real provider is connected,
 * implement `initiate` + webhook signature verification in the corresponding
 * adapter and the existing order pipeline will accept verified confirmations.
 */

export type PaymentProviderKey = "jazzcash" | "easypaisa" | "safepay";

export interface PaymentInitRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentInitResult {
  configured: boolean;
  redirectUrl?: string;
  reference?: string;
  reason?: string;
}

export interface PaymentAdapter {
  key: PaymentProviderKey;
  label: string;
  isConfigured(): boolean;
  initiate(request: PaymentInitRequest): Promise<PaymentInitResult>;
  verifyWebhook(rawBody: string, headers: Record<string, string>): Promise<{ orderId: string; reference: string; paid: boolean } | null>;
}

const PROVIDER_LABELS: Record<PaymentProviderKey, string> = {
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  safepay: "Safepay",
};

export function getConfiguredProviderKey(): PaymentProviderKey | null {
  const key = (process.env.PAYMENT_PROVIDER ?? "").toLowerCase();
  if (key === "jazzcash" || key === "easypaisa" || key === "safepay") return key;
  return null;
}

export function providerLabel(key: string | null | undefined) {
  if (!key) return "Online";
  return PROVIDER_LABELS[key as PaymentProviderKey] ?? "Online";
}

export function onlinePaymentsConfigured() {
  return Boolean(
    getConfiguredProviderKey() &&
      process.env.PAYMENT_MERCHANT_ID &&
      process.env.PAYMENT_INTEGRITY_SALT &&
      process.env.PAYMENT_WEBHOOK_SECRET,
  );
}

/** Placeholder adapter — refuses to pretend a payment happened. */
export function unsupportedAdapter(key: PaymentProviderKey): PaymentAdapter {
  return {
    key,
    label: PROVIDER_LABELS[key],
    isConfigured: () => false,
    async initiate() {
      return {
        configured: false,
        reason: `${PROVIDER_LABELS[key]} is not connected yet. Add merchant credentials to enable online payment, or choose cash on delivery.`,
      };
    },
    async verifyWebhook() {
      return null;
    },
  };
}

export function getPaymentAdapter(): PaymentAdapter | null {
  const key = getConfiguredProviderKey();
  if (!key) return null;
  return unsupportedAdapter(key);
}
