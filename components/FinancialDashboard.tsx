"use client";

import React, { useState, useMemo } from "react";
import { Invoice } from "@/types";
import { formatRupiah, formatDateIndo } from "@/lib/format";
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  FileText, 
  ArrowUpRight
} from "lucide-react";

interface FinancialDashboardProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onOpenCreateInvoice: () => void;
}

export default function FinancialDashboard({
  invoices,
  onViewInvoice,
  onOpenCreateInvoice,
}: FinancialDashboardProps) {
  // Filter state (Month & Year)
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // "all" or "01" - "12"
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  // Get available years from invoices
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add("2026");
    invoices.forEach((inv) => {
      if (inv.tanggal) {
        years.add(inv.tanggal.substring(0, 4));
      }
    });
    return Array.from(years).sort().reverse();
  }, [invoices]);

  // Filtered invoices based on selection
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (!inv.tanggal) return true;
      const [year, month] = inv.tanggal.split("-");
      const matchYear = selectedYear === "all" || year === selectedYear;
      const matchMonth = selectedMonth === "all" || month === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [invoices, selectedMonth, selectedYear]);

  // Aggregate Calculations
  const grandTotalTagihan = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0),
    [filteredInvoices]
  );

  const grandTotalUangMasuk = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + (inv.totalUangMasuk || 0), 0),
    [filteredInvoices]
  );

  const grandTotalLabaBersih = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + (inv.labaBersih || 0), 0),
    [filteredInvoices]
  );

  const grandTotalSisaTagihan = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + (inv.sisaTagihan || 0), 0),
    [filteredInvoices]
  );

  const totalPax = useMemo(
    () => filteredInvoices.reduce((sum, inv) => sum + (inv.qty || 0), 0),
    [filteredInvoices]
  );

  const profitMarginPercent = grandTotalTagihan > 0
    ? Math.round((grandTotalLabaBersih / grandTotalTagihan) * 100)
    : 0;

  const countLunas = filteredInvoices.filter((i) => i.status === "Lunas").length;
  const countDP = filteredInvoices.filter((i) => i.status === "DP (Down Payment)").length;
  const countBelumBayar = filteredInvoices.filter((i) => i.status === "Belum Bayar").length;

  // Monthly breakdown calculation for selected year
  const monthlySummary = useMemo(() => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const stats = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i + 1,
      monthKey: String(i + 1).padStart(2, "0"),
      monthName: monthNames[i],
      count: 0,
      totalTagihan: 0,
      uangMasuk: 0,
      labaBersih: 0,
      sisaTagihan: 0,
    }));

    invoices.forEach((inv) => {
      if (!inv.tanggal) return;
      const [year, month] = inv.tanggal.split("-");
      if (selectedYear !== "all" && year !== selectedYear) return;

      const idx = parseInt(month, 10) - 1;
      if (idx >= 0 && idx < 12) {
        stats[idx].count += 1;
        stats[idx].totalTagihan += inv.grandTotal || 0;
        stats[idx].uangMasuk += inv.totalUangMasuk || 0;
        stats[idx].labaBersih += inv.labaBersih || 0;
        stats[idx].sisaTagihan += inv.sisaTagihan || 0;
      }
    });

    // Return only months that have data, or all if selected
    return stats.filter((s) => s.count > 0 || (selectedMonth !== "all" && s.monthKey === selectedMonth));
  }, [invoices, selectedYear, selectedMonth]);

  return (
    <div className="space-y-4 sm:space-y-8 animate-fadeIn">
      {/* Top Banner & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>PangandaranHub Financial Overview</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Ringkasan Uang Masuk & Laba Bersih
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Pantau arus kas aktual, grand total omset, dan laba bersih trip wisata secara real-time.
          </p>
        </div>

        {/* Filter Toolbar (Full width side-by-side on mobile) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full md:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm font-medium text-slate-700 py-1.5 px-2.5 sm:px-3 rounded-lg border border-slate-200 focus:outline-teal-600 cursor-pointer shadow-2xs"
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

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm font-medium text-slate-700 py-1.5 px-2.5 sm:px-3 rounded-lg border border-slate-200 focus:outline-teal-600 cursor-pointer shadow-2xs"
          >
            <option value="all">Semua Tahun</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 4 Grand Total KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Grand Total Uang Masuk */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-emerald-700/15 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-emerald-100">
                Grand Total Uang Masuk
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              {formatRupiah(grandTotalUangMasuk)}
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-emerald-500/30 text-xs text-emerald-100 flex items-center justify-between">
            <span>Uang riil kas masuk</span>
            <span className="font-semibold bg-emerald-800/40 px-2 py-0.5 rounded-full">
              {filteredInvoices.length} Invoice
            </span>
          </div>
        </div>

        {/* Grand Total Laba Bersih */}
        <div className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-sky-700/15 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-sky-100">
                Grand Total Laba Bersih
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              {formatRupiah(grandTotalLabaBersih)}
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-sky-500/30 text-xs text-sky-100 flex items-center justify-between">
            <span>Margin Keuntungan</span>
            <span className="font-semibold bg-sky-800/40 px-2 py-0.5 rounded-full">
              ~{profitMarginPercent}% dari Omset
            </span>
          </div>
        </div>

        {/* Grand Total Nilai Tagihan (Omset) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-500">
                Grand Total Tagihan (Omset)
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatRupiah(grandTotalTagihan)}
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Akumulasi seluruh trip</span>
            <span className="font-medium text-slate-700">{totalPax} Pax</span>
          </div>
        </div>

        {/* Sisa Tagihan (Piutang) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-amber-600">
                Sisa Tagihan (Belum Masuk)
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-600 tracking-tight">
              {formatRupiah(grandTotalSisaTagihan)}
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Pelunasan pending</span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {countDP + countBelumBayar} Pending
            </span>
          </div>
        </div>
      </div>


      {/* Operational Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{totalPax} Pax</div>
            <div className="text-xs text-slate-500">Wisatawan Terlayani</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{countLunas} Trip</div>
            <div className="text-xs text-slate-500">Status Lunas Penuh</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{countDP} Trip</div>
            <div className="text-xs text-slate-500">Status DP Terbayar</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{countBelumBayar} Trip</div>
            <div className="text-xs text-slate-500">Menunggu Pembayaran</div>
          </div>
        </div>
      </div>

      {/* Monthly Recap Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Rekapitulasi Finansial Bulanan ({selectedYear === "all" ? "Semua Tahun" : selectedYear})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Menampilkan ringkasan uang masuk & laba per bulan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Bulan</th>
                <th className="px-6 py-3.5 text-center">Invoice</th>
                <th className="px-6 py-3.5 text-right">Grand Total Tagihan</th>
                <th className="px-6 py-3.5 text-right text-emerald-700">Total Uang Masuk</th>
                <th className="px-6 py-3.5 text-right text-sky-700">Total Laba Bersih</th>
                <th className="px-6 py-3.5 text-right text-amber-700">Sisa Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlySummary.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data transaksi invoice pada periode ini.
                  </td>
                </tr>
              ) : (
                monthlySummary.map((item) => (
                  <tr key={item.monthKey} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {item.monthName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {item.count} Trip
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {formatRupiah(item.totalTagihan)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      {formatRupiah(item.uangMasuk)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-sky-600">
                      {formatRupiah(item.labaBersih)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600">
                      {formatRupiah(item.sisaTagihan)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {monthlySummary.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                <tr>
                  <td className="px-6 py-4">Total Periode Terpilih</td>
                  <td className="px-6 py-4 text-center">{filteredInvoices.length} Trip</td>
                  <td className="px-6 py-4 text-right">{formatRupiah(grandTotalTagihan)}</td>
                  <td className="px-6 py-4 text-right text-emerald-600">{formatRupiah(grandTotalUangMasuk)}</td>
                  <td className="px-6 py-4 text-right text-sky-600">{formatRupiah(grandTotalLabaBersih)}</td>
                  <td className="px-6 py-4 text-right text-amber-600">{formatRupiah(grandTotalSisaTagihan)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Recent Invoices Financial Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Rincian Keuangan per Invoice
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian uang masuk, laba bersih, dan sisa tagihan dari masing-masing klien
            </p>
          </div>
          <button
            onClick={onOpenCreateInvoice}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>+ Buat Invoice</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ─── MOBILE VIEW: Cards for each Invoice (md:hidden) ─── */}
        <div className="block md:hidden p-3 space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Tidak ada invoice yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-50 rounded-xl border border-slate-200/90 p-3.5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {inv.nomorInvoice}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {formatDateIndo(inv.tanggal)}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === "Lunas"
                        ? "bg-emerald-100 text-emerald-800"
                        : inv.status === "DP (Down Payment)"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900">{inv.namaPemesan}</div>
                  <div className="text-[11px] text-slate-600 truncate">{inv.paketLayanan}</div>
                </div>

                <div className="grid grid-cols-3 gap-1 bg-white p-2 rounded-lg border border-slate-200/70 text-center">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">Omset</div>
                    <div className="text-[11px] font-bold text-slate-800 mt-0.5">
                      {formatRupiah(inv.grandTotal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-emerald-600 uppercase font-semibold">Uang Masuk</div>
                    <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                      {formatRupiah(inv.totalUangMasuk)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-sky-600 uppercase font-semibold">Laba</div>
                    <div className="text-[11px] font-bold text-sky-700 mt-0.5">
                      {formatRupiah(inv.labaBersih)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onViewInvoice(inv)}
                  className="w-full py-1.5 px-3 bg-white hover:bg-teal-50 text-teal-700 font-semibold rounded-lg text-xs border border-teal-200 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Lihat Faktur Resmi</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ─── DESKTOP VIEW: Table (hidden md:block) ─── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Invoice & Tanggal</th>
                <th className="px-6 py-3.5">Pemesan & Paket</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Grand Total</th>
                <th className="px-6 py-3.5 text-right text-emerald-700">Uang Masuk</th>
                <th className="px-6 py-3.5 text-right text-sky-700">Laba Bersih</th>
                <th className="px-6 py-3.5 text-right text-amber-700">Sisa Tagihan</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada invoice yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 font-mono text-xs">
                        {inv.nomorInvoice}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDateIndo(inv.tanggal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900">{inv.namaPemesan}</div>
                      <div className="text-xs text-slate-500 truncate" title={inv.paketLayanan}>
                        {inv.paketLayanan}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          inv.status === "Lunas"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.status === "DP (Down Payment)"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      {formatRupiah(inv.grandTotal)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      {formatRupiah(inv.totalUangMasuk)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-sky-600">
                      {formatRupiah(inv.labaBersih)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-amber-600">
                      {formatRupiah(inv.sisaTagihan)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                      >
                        Lihat Faktur
                      </button>
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

