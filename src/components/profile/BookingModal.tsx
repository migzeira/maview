import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import type { ProductItem } from "@/types/vitrine";

const WEEKDAY_MAP: Record<number, string> = { 0: "dom", 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab" };
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const generateTimeSlots = (start: string, end: string, durationMin: number): string[] => {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  while (mins + durationMin <= endMins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    mins += durationMin;
  }
  return slots;
};

export interface BookingModalProps {
  product: ProductItem;
  whatsapp: string;
  accent: string;
  accent2: string;
  bg: string;
  card: string;
  text: string;
  sub: string;
  border: string;
  onClose: () => void;
}

const BookingModal = ({ product, whatsapp, accent, accent2, card, text, sub, border, onClose }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = viewMonth.getDay();
  const availableDays = product.bookingDays || ["seg", "ter", "qua", "qui", "sex"];
  const duration = product.bookingDuration || 60;
  const slots = generateTimeSlots(product.bookingStart || "09:00", product.bookingEnd || "18:00", duration);

  const isDayAvailable = (date: Date) => {
    if (date < today) return false;
    const dayKey = WEEKDAY_MAP[date.getDay()];
    return availableDays.includes(dayKey);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const dateStr = `${String(selectedDate.getDate()).padStart(2, "0")}/${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`;
    const durationLabel = duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 ? duration % 60 + "min" : ""}` : `${duration}min`;
    const channel = product.bookingChannel || "whatsapp";

    if (channel === "google") {
      const [h, m] = selectedTime.split(":").map(Number);
      const startDt = new Date(selectedDate);
      startDt.setHours(h, m, 0);
      const endDt = new Date(startDt.getTime() + duration * 60000);
      const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(product.title)}&dates=${fmt(startDt)}/${fmt(endDt)}&details=${encodeURIComponent(`Agendado via Maview${product.price ? ` — ${product.price}` : ""}`)}`;
      window.open(gcalUrl, "_blank");
      if (whatsapp) {
        const msg = `Olá! Agendei via Google Calendar:\n\n📋 *${product.title}*\n📅 ${dateStr} às ${selectedTime}\n⏱️ Duração: ${durationLabel}${product.price ? `\n💰 ${product.price}` : ""}\n\nConfirmado no calendário!`;
        const phone = whatsapp.replace(/\D/g, "");
        setTimeout(() => window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank"), 500);
      }
    } else {
      const msg = `Olá! Gostaria de agendar:\n\n📋 *${product.title}*\n📅 ${dateStr} às ${selectedTime}\n⏱️ Duração: ${durationLabel}${product.price ? `\n💰 ${product.price}` : ""}\n\nPodemos confirmar?`;
      const phone = whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4" role="dialog" aria-modal="true" aria-label={`Agendar ${product.title}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[380px] rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        style={{ background: card, border: `1px solid ${border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-[16px] font-bold" style={{ color: text }}>Agendar</h3>
            <p className="text-[12px] mt-0.5" style={{ color: sub }}>{product.title}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ background: `${accent}18` }}>
            <X size={14} style={{ color: accent }} />
          </button>
        </div>

        {/* Calendar */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setMonthOffset(o => Math.max(0, o - 1))}
              disabled={monthOffset === 0} aria-label="Mês anterior"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: `${accent}18` }}>
              <ChevronLeft size={14} style={{ color: accent }} />
            </button>
            <span className="text-[13px] font-bold" style={{ color: text }}>
              {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button onClick={() => setMonthOffset(o => Math.min(2, o + 1))} aria-label="Próximo mês"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: `${accent}18` }}>
              <ChevronRight size={14} style={{ color: accent }} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold py-1" style={{ color: sub }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1);
              const available = isDayAvailable(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <button key={i}
                  onClick={() => { if (available) { setSelectedDate(date); setSelectedTime(null); } }}
                  disabled={!available}
                  className={`w-full aspect-square rounded-lg text-[12px] font-semibold transition-all ${
                    isSelected ? "scale-110" : available ? "hover:scale-105" : "opacity-40 cursor-not-allowed"
                  }`}
                  style={{
                    background: isSelected ? `linear-gradient(135deg, ${accent}, ${accent2})` : available ? `${accent}12` : "transparent",
                    color: isSelected ? "#fff" : text,
                    border: isSelected ? "none" : `1px solid ${available ? `${accent}20` : "transparent"}`,
                  }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="px-5 pb-4 animate-in slide-in-from-bottom-2 duration-200">
            <p className="text-[11px] font-bold mb-2" style={{ color: sub }}>
              Horários disponíveis — {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
            </p>
            <div className="flex gap-1.5 flex-wrap max-h-[120px] overflow-y-auto scrollbar-none">
              {slots.map(slot => {
                const isSel = selectedTime === slot;
                return (
                  <button key={slot} onClick={() => setSelectedTime(slot)}
                    className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${isSel ? "scale-105" : "hover:scale-105"}`}
                    style={{
                      background: isSel ? `linear-gradient(135deg, ${accent}, ${accent2})` : `${accent}12`,
                      color: isSel ? "#fff" : text,
                      border: `1px solid ${isSel ? accent : `${accent}20`}`,
                    }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Confirm */}
        <div className="px-5 pb-5 pt-2">
          <button onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="w-full py-3.5 rounded-2xl text-[14px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: selectedDate && selectedTime
                ? `linear-gradient(135deg, ${accent}, ${accent2})`
                : `${accent}30`,
              boxShadow: selectedDate && selectedTime ? `0 8px 24px ${accent}40` : "none",
            }}>
            <Calendar size={15} />
            {selectedDate && selectedTime
              ? `Confirmar ${selectedTime} — ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`
              : "Selecione data e horário"
            }
          </button>
          {product.price && (
            <p className="text-center text-[11px] mt-2 font-semibold" style={{ color: accent }}>
              {product.price} · {duration >= 60 ? `${Math.floor(duration / 60)}h${duration % 60 || ""}` : `${duration}min`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
