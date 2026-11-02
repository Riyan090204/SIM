"use client";

import React, { useState } from "react";
import { Invoice, PANGANDARAN_HUB_PROFILE } from "@/types";
import { formatRupiah, formatDateIndo, generateWhatsAppMessage } from "@/lib/format";
import { 
  Printer, 
  Share2, 
  X, 
  Check, 
  Compass, 
  Phone, 
  CreditCard,
  ShieldCheck,
  Download,
  Loader2
} from "lucide-react";

interface InvoicePrintViewProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
}

export default function InvoicePrintView({
  invoice,
  onClose,
  onEdit,
}: InvoicePrintViewProps) {
  const profile = PANGANDARAN_HUB_PROFILE;
  const [copied, setCopied] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [sigError, setSigError] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("invoice-printable-card");
    if (!element) return;

    try {
      setIsGeneratingPdf(true);
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice.nomorInvoice}.pdf`);
    } catch (error) {
      console.error("Gagal mengunduh PDF:", error);
      alert("Gagal mengunduh PDF. Silakan gunakan opsi Cetak.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppMessage(invoice);
    const cleanPhone = invoice.nomorTeleponPemesan
      .replace(/^0/, "62")
      .replace(/[^0-9]/g, "");
    
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    window.open(waUrl, "_blank");
  };

  const handleCopyText = async () => {
    const text = generateWhatsAppMessage(invoice);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Gagal menyalin teks.");
    }
  };

  const statusConfig = {
    "Lunas": { bg: "bg-emerald-600", text: "text-white", label: "LUNAS" },
    "DP (Down Payment)": { bg: "bg-amber-500", text: "text-white", label: "DP" },
    "Belum Bayar": { bg: "bg-red-500", text: "text-white", label: "BELUM BAYAR" },
    "Dibatalkan": { bg: "bg-slate-500", text: "text-white", label: "BATAL" },
  };

  const currentStatus = statusConfig[invoice.status] || statusConfig["Belum Bayar"];

  return (
    <div className="print-modal-overlay fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container Box */}
      <div className="print-card-wrapper bg-white rounded-2xl shadow-2xl max-w-[820px] w-full my-auto overflow-hidden border border-slate-200 print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide truncate">
              #{invoice.nomorInvoice}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={handleCopyText}
              title="Salin Rincian Invoice"
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Tersalin!" : "Salin"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              title="Kirim ke WhatsApp Tamu"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WA</span>
            </button>

            {/* Tombol Unduh PDF Langsung */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              title="Unduh langsung sebagai file PDF"
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 transition-colors cursor-pointer shadow-xs"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? "Mengunduh..." : "Download PDF"}</span>
            </button>

            {/* Tombol Cetak Fisik */}
            <button
              onClick={handlePrint}
              title="Cetak Faktur ke Mesin Printer"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            {onEdit && (
              <button
                onClick={() => onEdit(invoice)}
                className="hidden sm:block px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Edit
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-0.5 sm:ml-1"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PRINTABLE INVOICE SHEET — Wrapped in overflow-x-auto for mobile */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="overflow-x-auto print:overflow-visible">
          <div id="invoice-printable-card" className="print-card relative bg-white text-slate-800 min-w-[680px] sm:min-w-0">

            {/* Left Accent Stripe (Teal Bar) */}
            <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-teal-600 print:bg-teal-600" />


          <div className="pl-5 pr-6 py-5 sm:pl-7 sm:pr-8 sm:py-6 print:pl-5 print:pr-5 print:py-4">

            {/* ─── HEADER: Logo + Company Info + Invoice Meta ─── */}
            <div className="flex justify-between items-start gap-4 pb-3 print:pb-2">
              {/* Left: Company Identity */}
              <div className="flex items-start gap-3">
                {!logoError ? (
                  <img
                    src="/logo.PNG"
                    alt={profile.name}
                    onError={(e) => {
                      if ((e.currentTarget as HTMLImageElement).src.endsWith("/logo.PNG")) {
                        (e.currentTarget as HTMLImageElement).src = "/logo.png";
                      } else {
                        setLogoError(true);
                      }
                    }}
                    className="w-12 h-12 sm:w-14 sm:h-14 print:w-11 print:h-11 object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 print:w-11 print:h-11 rounded-lg bg-teal-700 flex items-center justify-center text-white">
                    <Compass className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl print:text-lg font-black tracking-tight text-slate-900 leading-none">
                    Pangandaran<span className="text-teal-600">Hub</span>
                  </h1>
                  <p className="text-[9px] print:text-[8px] font-bold text-slate-400 tracking-[0.15em] uppercase mt-0.5">
                    Tour & Travel Organizer
                  </p>
                  <div className="mt-1.5 print:mt-1 text-[10px] print:text-[9px] text-slate-500 leading-relaxed">
                    <div>{profile.address}</div>
                    <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>📞 {profile.phone}</span>
                      <span>✉ {profile.email}</span>
                    </div>
                    <div className="text-teal-700 font-semibold">🌐 {profile.website}</div>
                  </div>
                </div>
              </div>

              {/* Right: Invoice Number + Date */}
              <div className="text-right shrink-0">
                <div className="text-[8px] print:text-[7px] font-black tracking-[0.2em] text-slate-300 uppercase">
                  FAKTUR / INVOICE
                </div>
                <div className="text-base sm:text-lg print:text-sm font-black text-slate-900 font-mono tracking-tight mt-0.5 leading-tight">
                  {invoice.nomorInvoice}
                </div>
                <div className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded text-[9px] print:text-[8px] font-black uppercase tracking-wider ${currentStatus.bg} ${currentStatus.text}`}>
                  <ShieldCheck className="w-3 h-3" />
                  {currentStatus.label}
                </div>
                <div className="mt-2 print:mt-1.5 text-[10px] print:text-[9px] text-slate-500 space-y-0.5 leading-snug">
                  <div>Tanggal Faktur: <span className="font-semibold text-slate-700">{formatDateIndo(invoice.tanggal)}</span></div>
                  <div>Tanggal Trip: <span className="font-bold text-slate-900">{formatDateIndo(invoice.tanggalPelaksanaan)}</span></div>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="border-b-2 border-slate-800 mb-3 print:mb-2" />

            {/* ─── CLIENT INFORMATION ─── */}
            <div className="flex justify-between items-start gap-4 py-2.5 print:py-1.5 px-3 print:px-2.5 bg-slate-50 rounded border border-slate-200 mb-3 print:mb-2">
              <div className="text-[11px] print:text-[10px]">
                <div className="text-[8px] print:text-[7px] font-black tracking-[0.15em] text-slate-400 uppercase mb-0.5">
                  Ditujukan Kepada
                </div>
                <div className="text-sm print:text-xs font-bold text-slate-900">{invoice.namaPemesan}</div>
                {invoice.alamatPemesan && (
                  <div className="text-slate-500 mt-0.5 leading-snug">{invoice.alamatPemesan}</div>
                )}
              </div>
              <div className="text-right text-[11px] print:text-[10px] shrink-0">
                <div className="text-[8px] print:text-[7px] font-black tracking-[0.15em] text-slate-400 uppercase mb-0.5">
                  Kontak Pemesan
                </div>
                <div className="text-slate-800">
                  <span className="font-mono font-bold">{invoice.nomorTeleponPemesan}</span>
                </div>
                {invoice.emailPemesan && (
                  <div className="text-slate-500">{invoice.emailPemesan}</div>
                )}
              </div>
            </div>

            {/* Keterangan (if any) */}
            {invoice.keterangan && (
              <div className="mb-3 print:mb-2 text-[10px] print:text-[9px] text-teal-800 bg-teal-50/80 px-3 py-1.5 rounded border border-teal-200">
                <span className="font-bold">Keterangan:</span> {invoice.keterangan}
              </div>
            )}

            {/* ─── SERVICE TABLE ─── */}
            <table className="w-full text-[11px] print:text-[10px] mb-3 print:mb-2 border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left px-3 py-1.5 print:py-1 font-bold tracking-wide text-[10px] print:text-[9px] uppercase rounded-tl">
                    Paket Layanan / Item
                  </th>
                  <th className="text-center px-2 py-1.5 print:py-1 font-bold tracking-wide text-[10px] print:text-[9px] uppercase w-20">
                    Qty
                  </th>
                  <th className="text-right px-3 py-1.5 print:py-1 font-bold tracking-wide text-[10px] print:text-[9px] uppercase w-28">
                    Harga Satuan
                  </th>
                  <th className="text-right px-3 py-1.5 print:py-1 font-bold tracking-wide text-[10px] print:text-[9px] uppercase w-28 rounded-tr">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Main Package */}
                <tr className="border-b border-slate-200">
                  <td className="px-3 py-2 print:py-1.5">
                    <div className="font-bold text-slate-900">{invoice.paketLayanan}</div>
                    {invoice.deskripsi && (
                      <div className="text-[9px] print:text-[8px] text-slate-400 leading-tight mt-0.5 max-w-md">
                        {invoice.deskripsi}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 print:py-1.5 text-center font-semibold text-slate-700">
                    {invoice.tipeHitungan === "non-satuan" ? (
                      <span className="text-slate-300">—</span>
                    ) : (
                      <span>{invoice.qty} <span className="text-[9px] text-slate-400">Pax</span></span>
                    )}
                  </td>
                  <td className="px-3 py-2 print:py-1.5 text-right font-medium text-slate-600">
                    {invoice.tipeHitungan === "non-satuan" ? (
                      <span className="text-slate-300">—</span>
                    ) : (
                      formatRupiah(invoice.hargaSatuan)
                    )}
                  </td>
                  <td className="px-3 py-2 print:py-1.5 text-right font-bold text-slate-900">
                    {formatRupiah(invoice.total)}
                  </td>
                </tr>

                {/* Additional Services */}
                {invoice.layananTambahan && invoice.layananTambahan.length > 0 && (
                  invoice.layananTambahan.map((addon, idx) => (
                    <tr key={addon.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-slate-50/50" : "bg-white"}`}>
                      <td className="px-3 py-1.5 print:py-1 pl-5">
                        <span className="text-slate-400 mr-1">+</span>
                        <span className="font-medium text-slate-700">{addon.nama}</span>
                        <span className="ml-1.5 text-[8px] text-teal-600 bg-teal-50 px-1 py-px rounded border border-teal-200 font-semibold uppercase tracking-wider">
                          Tambahan
                        </span>
                      </td>
                      <td className="px-2 py-1.5 print:py-1 text-center text-slate-600 font-medium">
                        {addon.pakaiSatuan === false ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          addon.qty
                        )}
                      </td>
                      <td className="px-3 py-1.5 print:py-1 text-right text-slate-600 font-medium">
                        {addon.pakaiSatuan === false ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          formatRupiah(addon.harga)
                        )}
                      </td>
                      <td className="px-3 py-1.5 print:py-1 text-right font-semibold text-slate-800">
                        {formatRupiah(addon.total)}
                      </td>
                    </tr>
                  ))
                )}

                {/* Subtotal Row */}
                <tr className="bg-slate-100 border-t-2 border-slate-300">
                  <td colSpan={3} className="px-3 py-1.5 print:py-1 text-right font-bold text-slate-600 text-[10px] print:text-[9px] uppercase tracking-wider">
                    Grand Total
                  </td>
                  <td className="px-3 py-1.5 print:py-1 text-right font-black text-slate-900 text-sm print:text-xs">
                    {formatRupiah(invoice.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ─── PAYMENT SUMMARY + BANK INFO ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:gap-2 mb-3 print:mb-2">
              {/* Left: Bank Transfer Details */}
              <div className="border border-slate-300 rounded p-2.5 print:p-2 text-[10px] print:text-[9px]">
                <div className="flex items-center gap-1.5 text-slate-800 font-black text-[9px] print:text-[8px] uppercase tracking-wider mb-1.5 print:mb-1 pb-1 border-b border-slate-200">
                  <CreditCard className="w-3 h-3 text-teal-600" />
                  <span>Informasi Rekening Pembayaran</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Tujuan</span>
                    <span className="font-bold text-slate-900">{profile.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">No. Rekening</span>
                    <span className="font-mono font-bold text-slate-900 tracking-wider bg-slate-100 px-1.5 py-0.5 rounded text-[10px] print:text-[9px]">
                      {profile.bankAccountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atas Nama</span>
                    <span className="font-bold text-slate-900 uppercase">{profile.bankAccountName}</span>
                  </div>
                </div>
                <div className="mt-1.5 print:mt-1 pt-1 border-t border-dashed border-slate-200 text-[9px] print:text-[8px] text-slate-400 italic">
                  * Harap lampirkan bukti transfer konfirmasi kepada admin
                </div>
              </div>

              {/* Right: Payment Summary */}
              <div className="border border-slate-300 rounded p-2.5 print:p-2 text-[10px] print:text-[9px]">
                <div className="font-black text-[9px] print:text-[8px] uppercase tracking-wider text-slate-800 mb-1.5 print:mb-1 pb-1 border-b border-slate-200">
                  Ringkasan Pembayaran
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Tagihan</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(invoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2 py-1 -mx-0.5 rounded">
                    <span className="font-semibold">Uang Masuk (DP/Transfer)</span>
                    <span className="font-black font-mono">{formatRupiah(invoice.totalUangMasuk)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-900 uppercase text-[10px] print:text-[9px]">Sisa Tagihan</span>
                    <span className={`font-black font-mono text-sm print:text-xs ${invoice.sisaTagihan > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatRupiah(invoice.sisaTagihan)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── FOOTER: Notes + Signature ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:gap-2 border-t border-slate-200 pt-2.5 print:pt-2">
              {/* Left (2 cols): Terms & Conditions */}
              <div className="sm:col-span-2">
                <div className="text-[8px] print:text-[7px] font-black tracking-[0.15em] text-slate-400 uppercase mb-1">
                  Syarat & Ketentuan
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-[9px] print:text-[8px] text-slate-500 leading-tight">
                  {profile.notes.map((note, idx) => (
                    <li key={idx} className="pl-0.5">
                      <span>{note}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Right: Authorized Signature Block */}
              <div className="text-center flex flex-col items-center border border-slate-200 rounded p-2 print:p-1.5 bg-white min-h-[105px] print:min-h-[90px]">
                <span className="text-[9px] print:text-[8px] text-slate-400">
                  Pangandaran, {formatDateIndo(invoice.tanggal)}
                </span>

                {/* Signature + Name Group (overlapping) */}
                <div className="relative flex flex-col items-center justify-end flex-1 w-full">
                  {!sigError ? (
                    <div className="relative flex items-center justify-center -mb-4 sm:-mb-5 print:-mb-4 z-10 pointer-events-none">
                      <img
                        src="/signature.PNG"
                        alt="Tanda Tangan & Stempel Resmi"
                        onError={(e) => {
                          if ((e.currentTarget as HTMLImageElement).src.endsWith("/signature.PNG")) {
                            (e.currentTarget as HTMLImageElement).src = "/signature.png";
                          } else {
                            setSigError(true);
                          }
                        }}
                        className="h-16 sm:h-20 print:h-16 w-auto object-contain mix-blend-multiply"
                      />
                    </div>
                  ) : (
                    <div className="mb-1 py-0.5 px-3 border border-teal-200 rounded bg-teal-50/50">
                      <span className="text-[8px] font-black text-teal-800 tracking-wider uppercase block">
                        AUTHORIZED
                      </span>
                    </div>
                  )}

                  <div className="relative z-0 border-t border-slate-800 pt-0.5 px-4">
                    <div className="text-[10px] print:text-[9px] font-bold text-slate-900 uppercase tracking-wide whitespace-nowrap">
                      {profile.bankAccountName}
                    </div>
                    <div className="text-[8px] print:text-[7px] text-slate-400 italic">
                      Management {profile.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Internal Only Financial Note (Hidden in Print) */}

        <div className="no-print px-6 py-2.5 bg-indigo-50 border-t border-indigo-200 flex items-center justify-between text-xs text-indigo-900">
          <div>
            <span className="font-bold">🔒 Internal Admin:</span> Laba bersih{" "}
            <span className="font-extrabold text-indigo-700 underline">
              {formatRupiah(invoice.labaBersih)}
            </span>
          </div>
          <span className="text-[10px] text-indigo-500 italic">
            (Tidak tercetak)
          </span>
        </div>
      </div>
    </div>
  );
}
