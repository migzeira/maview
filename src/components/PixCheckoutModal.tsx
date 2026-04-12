import { useState, useEffect } from "react";
import { X, Copy, Check, QrCode } from "lucide-react";
import * as QRCode from "qrcode";

interface Props {
  product: { title: string; price: string; emoji?: string };
  pixKey: string;
  sellerName: string;
  accent: string;
  accent2?: string;
  bg: string;
  card: string;
  text: string;
  sub: string;
  border: string;
  onClose: () => void;
}

function buildPixCode(key: string, name: string, amount: string): string {
  const val = amount.replace(/[^\d,\.]/g, "").replace(",", ".");
  const n = name.slice(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z ]/g, "").trim();
  const gui = "0014br.gov.bcb.pix";
  const k = `01${key.length.toString().padStart(2, "0")}${key}`;
  const mai = `26${(gui.length + k.length).toString().padStart(2, "0")}${gui}${k}`;
  const mcc = "52040000";
  const cur = "5303986";
  const amt = val ? `54${val.length.toString().padStart(2, "0")}${val}` : "";
  const country = "5802BR";
  const nm = `59${n.length.toString().padStart(2, "0")}${n}`;
  const city = "6008BRASILIA";
  const addl = "62070503***";
  const payload = `0002${mai}${mcc}${cur}${amt}${country}${nm}${city}${addl}6304`;
  // CRC16
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xFFFF;
    }
  }
  return payload + crc.toString(16).toUpperCase().padStart(4, "0");
}

export default function PixCheckoutModal({ product, pixKey, sellerName, accent, accent2, bg, card, text, sub, border, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const code = buildPixCode(pixKey, sellerName, product.price);

  useEffect(() => {
    QRCode.toDataURL(code, { width: 240, margin: 2, color: { dark: "#000", light: "#fff" } })
      .then(setQrUrl).catch(() => {});
  }, [code]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); } catch {
      const t = document.createElement("textarea"); t.value = code;
      document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: card, border: `1px solid ${border}` }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full opacity-60 hover:opacity-100" style={{ color: sub }}><X size={18} /></button>
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl" style={{ background: `${accent}20` }}>{product.emoji || "💳"}</div>
          <h3 className="text-lg font-bold" style={{ color: text }}>{product.title}</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{product.price}</p>
        </div>
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-xl p-3">
            {qrUrl ? <img src={qrUrl} alt="PIX QR" className="w-48 h-48" /> : <div className="w-48 h-48 flex items-center justify-center"><QrCode size={48} className="text-gray-300 animate-pulse" /></div>}
          </div>
        </div>
        <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: copied ? "#10b981" : `linear-gradient(135deg, ${accent}, ${accent2 || accent})` }}>
          {copied ? <><Check size={16} /> Código copiado!</> : <><Copy size={16} /> Copiar código PIX</>}
        </button>
        <p className="text-center text-xs mt-3 opacity-60" style={{ color: sub }}>Abra o app do seu banco e cole o código PIX</p>
        <div className="mt-3 p-2 rounded-lg text-[9px] font-mono break-all opacity-30 leading-tight" style={{ color: sub, background: `${bg}80` }}>{code.slice(0, 80)}...</div>
      </div>
    </div>
  );
}
