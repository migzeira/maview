import { useState, useEffect, useRef, useCallback } from "react";
import { X, Copy, Check, CreditCard, QrCode, Loader2, AlertCircle } from "lucide-react";
import {
  createPixPayment,
  createCardPayment,
  checkPaymentStatus,
  type PaymentResponse,
  type PaymentStatus,
} from "@/lib/mercadopago";

/* ── Types ── */

interface Product {
  title: string;
  price: string;
  emoji?: string;
}

interface Props {
  product: Product;
  sellerAccessToken: string;
  buyerEmail?: string;
  accent: string;
  accent2?: string;
  bg: string;
  card: string;
  text: string;
  sub: string;
  border: string;
  onClose: () => void;
}

type Tab = "pix" | "card";

/* ── Helpers ── */

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^\d,\.]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function formatCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ── Component ── */

export default function MercadoPagoCheckout({
  product,
  sellerAccessToken,
  buyerEmail: initialEmail,
  accent,
  accent2,
  bg,
  card,
  text,
  sub,
  border,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>("pix");
  const amount = parsePrice(product.price);

  /* ── PIX state ── */
  const [pixLoading, setPixLoading] = useState(false);
  const [pixPayment, setPixPayment] = useState<PaymentResponse | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixStatus, setPixStatus] = useState<PaymentStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Card state ── */
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [installments, setInstallments] = useState(1);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardPayment, setCardPayment] = useState<PaymentResponse | null>(null);

  /* ── Shared ── */
  const [email, setEmail] = useState(initialEmail || "");
  const [error, setError] = useState("");

  /* ── Cleanup polling ── */
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ── PIX: create + poll ── */
  const handlePix = useCallback(async () => {
    if (!email) { setError("Informe seu email para continuar."); return; }
    setError("");
    setPixLoading(true);
    try {
      const res = await createPixPayment(
        sellerAccessToken,
        amount,
        product.title,
        email,
      );
      setPixPayment(res);
      setPixStatus(res.status as PaymentStatus);

      // Start polling
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const s = await checkPaymentStatus(sellerAccessToken, res.id);
          setPixStatus(s.status);
          if (s.status === "approved" || s.status === "rejected" || s.status === "cancelled") {
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch {
          // silent polling error
        }
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar pagamento PIX");
    } finally {
      setPixLoading(false);
    }
  }, [sellerAccessToken, amount, product.title, email]);

  /* ── PIX copy ── */
  const handleCopyPix = async () => {
    const code = pixPayment?.pix?.qr_code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const t = document.createElement("textarea");
      t.value = code;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  /* ── Card payment ── */
  const handleCard = async () => {
    if (!email) { setError("Informe seu email para continuar."); return; }
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      setError("Preencha todos os campos do cartao.");
      return;
    }
    setError("");
    setCardLoading(true);
    try {
      // NOTE: In a real production setup, the card token is generated client-side
      // using MercadoPago.js SDK (mp.createCardToken). For now we send card data
      // through a simplified flow. The seller should integrate the JS SDK for PCI compliance.
      const res = await createCardPayment(
        sellerAccessToken,
        amount,
        product.title,
        email,
        "", // token — needs MP.js SDK to generate
        installments,
        "visa", // simplified
      );
      setCardPayment(res);
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento");
    } finally {
      setCardLoading(false);
    }
  };

  /* ── Status rendering ── */
  const isApproved = pixStatus === "approved" || cardPayment?.status === "approved";
  const isRejected = pixStatus === "rejected" || cardPayment?.status === "rejected";

  /* ── Format card number with spaces ── */
  const fmtCard = (v: string) => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const fmtExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const gradient = `linear-gradient(135deg, ${accent}, ${accent2 || accent})`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ background: card, border: `1px solid ${border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: sub }}
        >
          <X size={18} />
        </button>

        {/* Product header */}
        <div className="text-center mb-5">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl"
            style={{ background: `${accent}20` }}
          >
            {product.emoji || "\uD83D\uDCB3"}
          </div>
          <h3 className="text-lg font-bold" style={{ color: text }}>
            {product.title}
          </h3>
          <p className="text-2xl font-bold mt-1" style={{ color: accent }}>
            {formatCurrency(amount)}
          </p>
        </div>

        {/* Approved / Rejected banner */}
        {isApproved && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-4 bg-emerald-500/10 border border-emerald-500/20">
            <Check size={20} className="text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-500">Pagamento aprovado!</span>
          </div>
        )}
        {isRejected && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl mb-4 bg-red-500/10 border border-red-500/20">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-sm font-semibold text-red-500">Pagamento recusado</span>
          </div>
        )}

        {/* Tabs */}
        {!isApproved && (
          <>
            <div
              className="flex rounded-xl p-1 mb-4"
              style={{ background: `${bg}`, border: `1px solid ${border}` }}
            >
              {(["pix", "card"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: tab === t ? card : "transparent",
                    color: tab === t ? text : sub,
                    boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {t === "pix" ? <QrCode size={14} /> : <CreditCard size={14} />}
                  {t === "pix" ? "PIX" : "Cartao"}
                </button>
              ))}
            </div>

            {/* Email input (shared) */}
            {!pixPayment && !cardPayment && (
              <div className="mb-4">
                <label className="text-xs font-medium mb-1 block" style={{ color: sub }}>
                  Seu email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    color: text,
                  }}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* ── PIX Tab ── */}
            {tab === "pix" && (
              <div>
                {!pixPayment ? (
                  <button
                    onClick={handlePix}
                    disabled={pixLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    style={{ background: gradient }}
                  >
                    {pixLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Gerando PIX...</>
                    ) : (
                      <><QrCode size={16} /> Pagar com PIX</>
                    )}
                  </button>
                ) : (
                  <>
                    {/* QR Code */}
                    {pixPayment.pix?.qr_code_base64 && (
                      <div className="flex justify-center mb-4">
                        <div className="bg-white rounded-xl p-3">
                          <img
                            src={`data:image/png;base64,${pixPayment.pix.qr_code_base64}`}
                            alt="PIX QR"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    )}

                    {/* Copy code button */}
                    <button
                      onClick={handleCopyPix}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: pixCopied ? "#10b981" : gradient }}
                    >
                      {pixCopied ? (
                        <><Check size={16} /> Codigo copiado!</>
                      ) : (
                        <><Copy size={16} /> Copiar codigo PIX</>
                      )}
                    </button>

                    {/* Status indicator */}
                    {pixStatus === "pending" && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <Loader2 size={14} className="animate-spin" style={{ color: accent }} />
                        <span className="text-xs" style={{ color: sub }}>
                          Aguardando pagamento...
                        </span>
                      </div>
                    )}

                    <p
                      className="text-center text-xs mt-3 opacity-60"
                      style={{ color: sub }}
                    >
                      Abra o app do seu banco e cole o codigo PIX
                    </p>
                  </>
                )}
              </div>
            )}

            {/* ── Card Tab ── */}
            {tab === "card" && !cardPayment && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: sub }}>
                    Numero do cartao
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(fmtCard(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: bg, border: `1px solid ${border}`, color: text }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: sub }}>
                      Validade
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(fmtExpiry(e.target.value))}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                      style={{ background: bg, border: `1px solid ${border}`, color: text }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: sub }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                      style={{ background: bg, border: `1px solid ${border}`, color: text }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: sub }}>
                    Nome no cartao
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="NOME COMPLETO"
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: bg, border: `1px solid ${border}`, color: text }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: sub }}>
                    Parcelas
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                    style={{ background: bg, border: `1px solid ${border}`, color: text }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatCurrency(amount / n)}
                        {n === 1 ? " (a vista)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCard}
                  disabled={cardLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: gradient }}
                >
                  {cardLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Processando...</>
                  ) : (
                    <><CreditCard size={16} /> Pagar {formatCurrency(amount)}</>
                  )}
                </button>

                <p className="text-center text-[10px] mt-1 opacity-40" style={{ color: sub }}>
                  Pagamento processado pelo Mercado Pago. Seus dados estao seguros.
                </p>
              </div>
            )}
          </>
        )}

        {/* Payment ID footer */}
        {(pixPayment || cardPayment) && (
          <div
            className="mt-4 p-2 rounded-lg text-[9px] font-mono break-all opacity-30 leading-tight"
            style={{ color: sub, background: `${bg}80` }}
          >
            ID: {pixPayment?.id || cardPayment?.id}
          </div>
        )}
      </div>
    </div>
  );
}
