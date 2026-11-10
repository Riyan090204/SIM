"use client";

import React, { useState, useMemo } from "react";
import { Invoice } from "@/types";
import { formatRupiah, formatDateIndo, generateWhatsAppMessage } from "@/lib/format";
import {
  Search,
  Plus,
  Printer,
  Edit3,
  Trash2,
  Share2,
  Calendar,
  AlertCircle,
  Phone,
  User,
  Clock
} from "lucide-react";

interface InvoiceListProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onOpenCreateInvoice: () => void;
}

export default function InvoiceList({
  invoices,
  onViewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onOpenCreateInvoice,
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search text
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.nomorInvoice.toLowerCase().includes(q) ||
        inv.namaPemesan.toLowerCase().includes(q) ||
        inv.paketLayanan.toLowerCase().includes(q) ||
        inv.nomorTeleponPemesan.toLowerCase().includes(q);

      // Status
      const matchStatus = selectedStatus === "all" || inv.status === selectedStatus;

      // Month
      const matchMonth =
        selectedMonth === "all" ||
        (inv.tanggal && inv.tanggal.split("-")[1] === selectedMonth);

      return matchSearch && matchStatus && matchMonth;
    });
  }, [invoices, searchQuery, selectedStatus, selectedMonth]);

  const handleShareWhatsApp = (inv: Invoice) => {
    const message = generateWhatsAppMessage(inv);
    const encoded = encodeURIComponent(message);
    const cleanPhone = inv.nomorTeleponPemesan
      ? inv.nomorTeleponPemesan.replace(/[^0-9]/g, "").replace(/^0/, "62")
      : "";

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Top Bar Header & Action */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Manajemen Tagihan Wisata</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Daftar Faktur & Invoice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Kelola, cetak, dan bagikan invoice ke tamu beserta rincian pembayarannya.
          </p>
        </div>

        <button
          onClick={onOpenCreateInvoice}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Invoice Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor invoice, tamu, paket, no HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-teal-600 focus:bg-white"
          />
        </div>

        {/* Status & Month Dropdowns (Side-by-side on mobile) */}
        <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-teal-600 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="DP (Down Payment)">DP</option>
            <option value="Belum Bayar">Belum Bayar</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-teal-600 cursor-pointer"
          >
            <option value="all">Semua Bulan</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>
      </div>

      {/* ─── 1. MOBILE INVOICE CARDS (md:hidden) ─── */}
      <div className="block md:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              Tidak ada invoice yang sesuai pencarian atau filter.
            </p>
            <button
              onClick={onOpenCreateInvoice}
              className="mt-3 px-4 py-2 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg hover:bg-teal-100 border border-teal-200"
            >
              + Buat Invoice Baru
            </button>
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3"
            >
              {/* Header: Invoice No + Date + Status */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {inv.nomorInvoice}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDateIndo(inv.tanggal)}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${inv.status === "Lunas"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : inv.status === "DP (Down Payment)"
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  {inv.status}
                </span>
              </div>

              {/* Customer & Trip Details */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inv.namaPemesan}</span>
                </div>
                {inv.nomorTeleponPemesan && (
                  <div className="text-xs text-slate-500 pl-5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{inv.nomorTeleponPemesan}</span>
                  </div>
                )}
                <div className="text-xs font-medium text-slate-700 pt-1">
                  {inv.paketLayanan}
                </div>
                <div className="text-[11px] text-teal-700 font-semibold">
                  {inv.qty} Pax • Pelaksanaan: {formatDateIndo(inv.tanggalPelaksanaan)}
                </div>
              </div>

              {/* Financial Breakdown (3-column mini summary) */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Grand Total</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {formatRupiah(inv.grandTotal)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-600 uppercase font-medium">Uang Masuk</div>
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">
                    {formatRupiah(inv.totalUangMasuk)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-600 uppercase font-medium">Sisa Tagihan</div>
                  <div className="text-xs font-bold text-amber-700 mt-0.5">
                    {formatRupiah(inv.sisaTagihan)}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onViewInvoice(inv)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Lihat & Unduh PDF</span>
                </button>

                <button
                  onClick={() => handleShareWhatsApp(inv)}
                  title="Kirim ke WhatsApp"
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WA</span>
                </button>

                <button
                  onClick={() => onEditInvoice(inv)}
                  title="Edit Invoice"
                  className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteInvoice(inv.id)}
                  title="Hapus Invoice"
                  className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200/60"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── 2. DESKTOP INVOICE TABLE (hidden md:block) ─── */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Faktur</th>
                <th className="px-5 py-3.5">Pemesan & Kontak</th>
                <th className="px-5 py-3.5">Paket Wisata</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Grand Total</th>
                <th className="px-5 py-3.5 text-right text-emerald-700">Uang Masuk</th>
                <th className="px-5 py-3.5 text-right text-sky-700">Laba Bersih</th>
                <th className="px-5 py-3.5 text-right text-amber-700">Sisa Tagihan</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-3">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-medium text-slate-600">
                        Tidak ada invoice yang sesuai pencarian atau filter.
                      </p>
                      <button
                        onClick={onOpenCreateInvoice}
                        className="px-4 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg hover:bg-teal-100 border border-teal-200"
                      >
                        + Buat Invoice Baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Invoice ID & Date */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 font-mono text-xs">
                        {inv.nomorInvoice}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDateIndo(inv.tanggal)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{inv.namaPemesan}</div>
                      <div className="text-[11px] text-slate-500">{inv.nomorTeleponPemesan}</div>
                    </td>

                    {/* Service Package */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-slate-800 truncate" title={inv.paketLayanan}>
                        {inv.paketLayanan}
                      </div>
                      <div className="text-[11px] text-teal-700 font-semibold">
                        {inv.qty} Pax • Pelaksanaan: {formatDateIndo(inv.tanggalPelaksanaan)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${inv.status === "Lunas"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.status === "DP (Down Payment)"
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    {/* Financial Numbers */}
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {formatRupiah(inv.grandTotal)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-emerald-600">
                      {formatRupiah(inv.totalUangMasuk)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-sky-600">
                      {formatRupiah(inv.labaBersih)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-amber-600">
                      {formatRupiah(inv.sisaTagihan)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="Lihat & Unduh PDF Faktur"
                          className="p-1.5 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(inv)}
                          title="Kirim ke WhatsApp"
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditInvoice(inv)}
                          title="Edit Invoice"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          title="Hapus Invoice"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
