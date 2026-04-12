/* ─── Mercado Pago Payment Service ─────────────────────────────
   Uses the REST API v1 via fetch — no SDK needed.
   Access token is passed per-call (from vitrine design config).
─────────────────────────────────────────────────────────────── */

const API = "https://api.mercadopago.com/v1";

/* ── Types ── */

export interface PixPaymentData {
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
}

export interface PaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  payment_method_id: string;
  pix?: PixPaymentData;
}

export type PaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

/* ── Helpers ── */

async function mpFetch<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Idempotency-Key": crypto.randomUUID(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

/* ── Create PIX Payment ── */

export async function createPixPayment(
  accessToken: string,
  amount: number,
  description: string,
  email: string,
): Promise<PaymentResponse> {
  const body = {
    transaction_amount: amount,
    description,
    payment_method_id: "pix",
    payer: { email },
  };

  const raw = await mpFetch<any>("/payments", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    id: raw.id,
    status: raw.status,
    status_detail: raw.status_detail,
    payment_method_id: raw.payment_method_id,
    pix: raw.point_of_interaction?.transaction_data
      ? {
          qr_code: raw.point_of_interaction.transaction_data.qr_code ?? "",
          qr_code_base64:
            raw.point_of_interaction.transaction_data.qr_code_base64 ?? "",
          ticket_url:
            raw.point_of_interaction.transaction_data.ticket_url ?? "",
        }
      : undefined,
  };
}

/* ── Create Card Payment ── */

export async function createCardPayment(
  accessToken: string,
  amount: number,
  description: string,
  email: string,
  token: string,
  installments: number,
  paymentMethodId: string,
): Promise<PaymentResponse> {
  const body = {
    transaction_amount: amount,
    description,
    payment_method_id: paymentMethodId,
    token,
    installments,
    payer: { email },
  };

  const raw = await mpFetch<any>("/payments", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    id: raw.id,
    status: raw.status,
    status_detail: raw.status_detail,
    payment_method_id: raw.payment_method_id,
  };
}

/* ── Check Payment Status ── */

export async function checkPaymentStatus(
  accessToken: string,
  paymentId: number,
): Promise<{ status: PaymentStatus; status_detail: string }> {
  const raw = await mpFetch<any>(`/payments/${paymentId}`, accessToken, {
    method: "GET",
  });

  return {
    status: raw.status,
    status_detail: raw.status_detail,
  };
}
