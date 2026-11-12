"use client";

import React, { useState } from "react";
import { Sparkles, Clipboard, CheckCircle2, X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { parseWhatsAppBooking, ParsedBookingData } from "@/lib/textParser";

interface SmartPasteBoxProps {
  onApply: (data: ParsedBookingData) => void;
  title?: string;
  description?: string;
}

export default function SmartPasteBox({
  onApply,
  title = "Smart Paste dari Chat WhatsApp",
  description = "Salin format pesan pemesanan WhatsApp tamu, lalu tempel di sini untuk mengisi form secara otomatis.",
}: SmartPasteBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          setRawText(clipText);
          handleProcessText(clipText);
          return;
        }
      }
      setErrorInfo("Silakan tempel (Ctrl+V / Paste) teks secara manual pada kotak di bawah.");
    } catch {
      setErrorInfo("Akses clipboard tidak diizinkan. Silakan tempel secara manual.");
    }
  };

  const handleProcessText = (textToProcess?: string) => {
    const text = textToProcess !== undefined ? textToProcess : rawText;
    setErrorInfo(null);

    if (!text || !text.trim()) {
      setErrorInfo("Kotak teks masih kosong. Silakan tempel format chat WhatsApp terlebih dahulu.");
      return;
    }

    const parsed = parseWhatsAppBooking(text);

    // Hitung berapa field yang berhasil diekstrak
    const extractedFields: string[] = [];
    if (parsed.namaPemesan) extractedFields.push(`Nama (${parsed.namaPemesan})`);
    if (parsed.nomorHp) extractedFields.push(`HP (${parsed.nomorHp})`);
    if (parsed.pilihanPaket) extractedFields.push("Paket Layanan");
    if (parsed.tanggalTrip) extractedFields.push(`Tgl Trip (${parsed.tanggalTrip})`);
    if (parsed.nomorKendaraan) extractedFields.push("No. Kendaraan");
    if (parsed.alamat) extractedFields.push("Alamat");
    if (parsed.instagram) extractedFields.push("Instagram");
    if (parsed.email) extractedFields.push("Email");
    if (parsed.peserta && parsed.peserta.length > 0) extractedFields.push(`${parsed.peserta.length} Peserta`);
    if (parsed.estimasiWaktuKedatangan) extractedFields.push(`Jam (${parsed.estimasiWaktuKedatangan})`);

    if (extractedFields.length === 0) {
      setErrorInfo("Sistem belum dapat mengenali data dari teks yang ditempel. Pastikan teks berisi label seperti 'Nama Pemesan:', 'HP:', atau 'Pilih Paket:'.");
      return;
    }

    onApply(parsed);
    setSuccessInfo(`Berhasil mengekstrak ${extractedFields.length} data: ${extractedFields.slice(0, 4).join(", ")}${extractedFields.length > 4 ? " dll." : "."}`);
    setIsOpen(false);
    setTimeout(() => setSuccessInfo(null), 5000);
  };

  return (
    <div className="rounded-xl border border-teal-200/90 bg-gradient-to-r from-teal-50/70 via-sky-50/50 to-emerald-50/70 p-3 sm:p-3.5 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900">{title}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-teal-600 text-white shadow-2xs">
                Auto-Fill
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isOpen && (
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              title="Baca langsung dari clipboard"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Tempel Cepat</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setErrorInfo(null);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
              isOpen
                ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            <span>{isOpen ? "Tutup" : "Tempel Teks"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successInfo && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successInfo}</span>
        </div>
      )}

      {/* Expandable Paste Area */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-teal-200/80 space-y-2.5 animate-fadeIn">
          <p className="text-[11px] text-slate-600 sm:hidden">
            {description}
          </p>

          <div className="relative">
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (errorInfo) setErrorInfo(null);
              }}
              rows={6}
              placeholder="Tempel teks format WhatsApp di sini...&#10;Contoh:&#10;▪️Nama Pemesan: Disa&#10;▪️HP: 088707611386&#10;▪️Pilih Paket: 1 Orang Singgle Paddle...&#10;▪️Tanggal Trip: 06 november, estimasi jam 2 siang"
              className="w-full p-2.5 bg-white border border-teal-300/90 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-400 leading-relaxed shadow-inner"
            />

            {rawText && (
              <button
                type="button"
                onClick={() => setRawText("")}
                title="Hapus teks"
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {errorInfo && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorInfo}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-slate-500">
              💡 Format chat seperti tanda titik dua (:), bullet, atau nomor peserta akan otomatis diproses.
            </span>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleProcessText()}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white transition-all shadow-sm shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ekstrak & Isi Otomatis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

