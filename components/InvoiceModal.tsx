"use client";

import React, { useState } from "react";
import { Invoice, Booking, AdditionalService, PaymentStatus } from "@/types";
import { formatRupiah } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { getAccountProfile, AccountProfile } from "@/lib/accountConfig";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  DollarSign,
  Wallet,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Zap,
  Mail,
  Calculator
} from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  initialInvoice?: Invoice | null;
  bookings: Booking[];
  selectedBookingForInvoice?: Booking | null;
}

function getInitialInvoiceData(
  initialInvoice?: Invoice | null,
  selectedBooking?: Booking | null,
  profile?: AccountProfile
) {
  const prefix = profile?.invoicePrefix || "PH";

  if (initialInvoice) {
    return {
      nomorInvoice: initialInvoice.nomorInvoice || "",
      tanggal: initialInvoice.tanggal || new Date().toISOString().split("T")[0],
      status: initialInvoice.status || ("Belum Bayar" as PaymentStatus),
      bookingId: initialInvoice.bookingId || "",
      namaPemesan: initialInvoice.namaPemesan || "",
      alamatPemesan: initialInvoice.alamatPemesan || "",
      emailPemesan: initialInvoice.emailPemesan || "",
      nomorTeleponPemesan: initialInvoice.nomorTeleponPemesan || "",
      paketLayanan: initialInvoice.paketLayanan || "",
      tanggalPelaksanaan: initialInvoice.tanggalPelaksanaan || "",
      deskripsi: initialInvoice.deskripsi || "",
      keterangan: initialInvoice.keterangan || "",
      tipeHitungan: initialInvoice.tipeHitungan || ("satuan" as const),
      qty: initialInvoice.qty || 1,
      hargaSatuan: initialInvoice.hargaSatuan || 0,
      total: initialInvoice.total || (initialInvoice.qty || 1) * (initialInvoice.hargaSatuan || 0),
      layananTambahan: initialInvoice.layananTambahan || [],
      totalUangMasuk: initialInvoice.totalUangMasuk || 0,
      labaBersih: initialInvoice.labaBersih || 0,
    };
  }
  if (selectedBooking) {
    const today = new Date();
    const ym = today.toISOString().slice(0, 7).replace("-", "");
    const rand = Math.floor(100 + Math.random() * 900);
    return {
      nomorInvoice: `INV-${prefix}-${ym}-${rand}`,
      tanggal: new Date().toISOString().split("T")[0],
      status: "Belum Bayar" as PaymentStatus,
      bookingId: selectedBooking.id,
      namaPemesan: selectedBooking.namaPemesan,
      nomorTeleponPemesan: selectedBooking.nomorHp,
      alamatPemesan: selectedBooking.alamat || "",
      emailPemesan: selectedBooking.email || "",
      paketLayanan: selectedBooking.pilihanPaket,
      tanggalPelaksanaan: selectedBooking.tanggalTrip,
      deskripsi: `Paket wisata ${profile?.name || "wisata"} include guide, tiket masuk, peralatan, dan asuransi.`,
      keterangan: `Booking #${selectedBooking.bookingCode} | Kendaraan: ${selectedBooking.nomorKendaraan || "-"}`,
      tipeHitungan: "satuan" as const,
      qty: selectedBooking.peserta && selectedBooking.peserta.length > 0 ? selectedBooking.peserta.length : 1,
      hargaSatuan: 200000,
      total: (selectedBooking.peserta && selectedBooking.peserta.length > 0 ? selectedBooking.peserta.length : 1) * 200000,
      layananTambahan: [],
      totalUangMasuk: 0,
      labaBersih: 250000,
    };
  }
  const today = new Date();
  const ym = today.toISOString().slice(0, 7).replace("-", "");
  const rand = Math.floor(100 + Math.random() * 900);
  return {
    nomorInvoice: `INV-${prefix}-${ym}-${rand}`,
    tanggal: new Date().toISOString().split("T")[0],
    status: "Belum Bayar" as PaymentStatus,
    bookingId: "",
    namaPemesan: "",
    alamatPemesan: "",
    emailPemesan: "",
    nomorTeleponPemesan: "",
    paketLayanan: "Paket Body Rafting Green Canyon",
    tanggalPelaksanaan: new Date().toISOString().split("T")[0],
    deskripsi: "Paket lengkap peralatan safety, pemandu lokal bersertifikat, perahu antar jemput, dan asuransi.",
    keterangan: "",
    tipeHitungan: "satuan" as const,
    qty: 5,
    hargaSatuan: 225000,
    total: 1125000,
    layananTambahan: [],
    totalUangMasuk: 0,
    labaBersih: 300000,
  };
}

export default function InvoiceModal({
  isOpen,
  onClose,
  onSave,
  initialInvoice,
  bookings,
  selectedBookingForInvoice,
}: InvoiceModalProps) {
  const { user } = useAuth();
  const currentEmail = initialInvoice?.userEmail || selectedBookingForInvoice?.userEmail || user?.email;
  const profile = getAccountProfile(currentEmail);
  const initial = getInitialInvoiceData(initialInvoice, selectedBookingForInvoice, profile);

  // Form State
  const [nomorInvoice, setNomorInvoice] = useState(initial.nomorInvoice);
  const [tanggal, setTanggal] = useState(initial.tanggal);
  const [status, setStatus] = useState<PaymentStatus>(initial.status);
  const [bookingId, setBookingId] = useState<string>(initial.bookingId);

  // Customer Data
  const [namaPemesan, setNamaPemesan] = useState(initial.namaPemesan);
  const [alamatPemesan, setAlamatPemesan] = useState(initial.alamatPemesan);
  const [emailPemesan, setEmailPemesan] = useState(initial.emailPemesan);
  const [nomorTeleponPemesan, setNomorTeleponPemesan] = useState(initial.nomorTeleponPemesan);

  // Main Tour Package
  const [paketLayanan, setPaketLayanan] = useState(initial.paketLayanan);
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState(initial.tanggalPelaksanaan);
  const [deskripsi, setDeskripsi] = useState(initial.deskripsi);
  const [keterangan, setKeterangan] = useState(initial.keterangan);

  // Tipe Hitungan: 'satuan' (Qty x Harga) vs 'non-satuan' (Tanpa Satuan / -)
  const [tipeHitungan, setTipeHitungan] = useState<"satuan" | "non-satuan">(initial.tipeHitungan || "satuan");
  const [qty, setQty] = useState<number>(initial.qty);
  const [hargaSatuan, setHargaSatuan] = useState<number>(initial.hargaSatuan);
  const [fixedTotal, setFixedTotal] = useState<number>(initial.total || 0);

  // Additional Services (Add-ons)
  const [layananTambahan, setLayananTambahan] = useState<AdditionalService[]>(initial.layananTambahan);

  // Financial fields
  const [totalUangMasuk, setTotalUangMasuk] = useState<number>(initial.totalUangMasuk);
  const [labaBersih, setLabaBersih] = useState<number>(initial.labaBersih);

  // Error message
  const [errorMsg, setErrorMsg] = useState("");

  // Populate from Booking
  const populateFromBooking = (b: Booking) => {
    setBookingId(b.id);
    setNamaPemesan(b.namaPemesan);
    setNomorTeleponPemesan(b.nomorHp);
    setAlamatPemesan(b.alamat || "");
    setEmailPemesan(b.email || "");
    setPaketLayanan(b.pilihanPaket);
    setTanggalPelaksanaan(b.tanggalTrip);
    setQty(b.peserta && b.peserta.length > 0 ? b.peserta.length : 1);
    setHargaSatuan(200000);
    setFixedTotal((b.peserta && b.peserta.length > 0 ? b.peserta.length : 1) * 200000);
    setTanggal(new Date().toISOString().split("T")[0]);
    setKeterangan(`Booking #${b.bookingCode} | Kendaraan: ${b.nomorKendaraan || "-"}`);
    setDeskripsi(`Paket wisata ${profile.name} include guide, tiket masuk, peralatan, dan asuransi.`);
    setTotalUangMasuk(0);
    setLabaBersih(250000);
    setTipeHitungan("satuan");
  };

  const handleBookingSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setBookingId(bId);
    if (!bId) return;
    const found = bookings.find((b) => b.id === bId);
    if (found) {
      populateFromBooking(found);
    }
  };

  // Add-on services management
  const handleAddService = (isSatuan: boolean = true) => {
    setLayananTambahan([
      ...layananTambahan,
      {
        id: `addon-${Date.now()}`,
        nama: "",
        pakaiSatuan: isSatuan,
        qty: isSatuan ? 1 : 0,
        harga: 0,
        total: 0,
      },
    ]);
  };

  const handleUpdateService = (
    id: string,
    field: "nama" | "qty" | "harga" | "total" | "pakaiSatuan",
    value: string | number | boolean
  ) => {
    setLayananTambahan(
      layananTambahan.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (updated.pakaiSatuan !== false) {
          if (field === "qty" || field === "harga") {
            updated.total = Number(updated.qty || 0) * Number(updated.harga || 0);
          }
        }
        return updated;
      })
    );
  };

  const handleRemoveService = (id: string) => {
    setLayananTambahan(layananTambahan.filter((item) => item.id !== id));
  };

  // Email shortcut
  const handleApplyEmailDomain = (domain: string) => {
    if (!emailPemesan.trim()) {
      const safeName = namaPemesan ? namaPemesan.toLowerCase().replace(/[^a-z0-9]/g, "") : "tamu";
      setEmailPemesan(`${safeName}${domain}`);
      return;
    }
    const prefix = emailPemesan.split("@")[0].trim();
    setEmailPemesan(`${prefix}${domain}`);
  };

  // Calculations
  const mainPackageTotal = tipeHitungan === "satuan"
    ? (Number(qty) || 0) * (Number(hargaSatuan) || 0)
    : (Number(fixedTotal) || 0);

  const additionalTotal = layananTambahan.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const grandTotal = mainPackageTotal + additionalTotal;
  const sisaTagihan = Math.max(0, grandTotal - (Number(totalUangMasuk) || 0));

  // Quick Payment Handlers
  const handleQuickSetPayment = (amount: number, newStatus: PaymentStatus) => {
    setTotalUangMasuk(amount);
    setStatus(newStatus);
  };

  const handleUangMasukChange = (val: number) => {
    setTotalUangMasuk(val);
    if (val >= grandTotal && grandTotal > 0) {
      setStatus("Lunas");
    } else if (val > 0) {
      setStatus("DP (Down Payment)");
    } else {
      setStatus("Belum Bayar");
    }
  };

  const handleStatusChange = (newStatus: PaymentStatus) => {
    setStatus(newStatus);
    if (newStatus === "Lunas" && totalUangMasuk < grandTotal) {
      setTotalUangMasuk(grandTotal);
    } else if (newStatus === "Belum Bayar") {
      setTotalUangMasuk(0);
    } else if (newStatus === "DP (Down Payment)" && totalUangMasuk === 0) {
      setTotalUangMasuk(Math.round(grandTotal * 0.3));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomorInvoice.trim()) {
      setErrorMsg("Nomor Invoice wajib diisi!");
      return;
    }
    if (!namaPemesan.trim()) {
      setErrorMsg("Nama Pemesan wajib diisi!");
      return;
    }
    if (!paketLayanan.trim()) {
      setErrorMsg("Nama Paket Layanan wajib diisi!");
      return;
    }

    const newInvoice: Invoice = {
      id: initialInvoice ? initialInvoice.id : `inv-${Date.now()}`,
      bookingId: bookingId || undefined,
      nomorInvoice: nomorInvoice.trim(),
      tanggal: tanggal || new Date().toISOString().split("T")[0],
      status,
      namaPemesan: namaPemesan.trim(),
      alamatPemesan: alamatPemesan.trim(),
      emailPemesan: emailPemesan.trim(),
      nomorTeleponPemesan: nomorTeleponPemesan.trim(),
      paketLayanan: paketLayanan.trim(),
      tanggalPelaksanaan: tanggalPelaksanaan || tanggal,
      deskripsi: deskripsi.trim(),
      keterangan: keterangan.trim(),
      tipeHitungan,
      qty: tipeHitungan === "satuan" ? (Number(qty) || 1) : 0,
      hargaSatuan: tipeHitungan === "satuan" ? (Number(hargaSatuan) || 0) : 0,
      total: mainPackageTotal,
      layananTambahan,
      grandTotal,
      totalUangMasuk: Number(totalUangMasuk) || 0,
      sisaTagihan,
      labaBersih: Number(labaBersih) || 0,
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      userEmail: initialInvoice?.userEmail || selectedBookingForInvoice?.userEmail,
      userId: initialInvoice?.userId || selectedBookingForInvoice?.userId,
    };

    onSave(newInvoice);
    onClose();
  };

  // Navigasi Keyboard Enter: saat menekan Enter pada input, otomatis lompat ke input berikutnya
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      const target = e.target as HTMLElement;
      if (target.getAttribute("type") === "submit") return;

      e.preventDefault();
      const form = e.currentTarget;
      const focusable = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button[type="submit"]'
        )
      );

      const index = focusable.indexOf(target);
      if (index > -1 && index + 1 < focusable.length) {
        focusable[index + 1].focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Receipt className="w-5 h-5 text-teal-400 shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold truncate">
              {initialInvoice ? "Edit Faktur / Invoice" : "Buat Invoice Wisata Baru"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[85vh] overflow-y-auto text-xs sm:text-sm"
        >



          {/* Option: Import from Booking */}
          {!initialInvoice && bookings.length > 0 && (
            <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-teal-900">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-semibold text-xs">Isi Otomatis dari Data Booking:</span>
              </div>
              <select
                value={bookingId}
                onChange={handleBookingSelectChange}
                className="bg-white text-xs font-medium text-slate-700 py-1.5 px-3 rounded-lg border border-teal-300 focus:outline-teal-600 w-full sm:w-auto"
              >
                <option value="">-- Pilih Booking Tamu --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingCode} - {b.namaPemesan} ({b.pilihanPaket})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 1: Meta Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Nomor Invoice <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomorInvoice}
                onChange={(e) => setNomorInvoice(e.target.value)}
                placeholder={`INV-${profile.invoicePrefix}-202610-001`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-teal-600 font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Tanggal Faktur
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-teal-600 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Status Pembayaran
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-teal-600 font-semibold text-xs"
              >
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="DP (Down Payment)">DP (Down Payment)</option>
                <option value="Lunas">Lunas</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Section 2: Data Pemesan */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Data Klien / Pemesan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1 text-xs">
                  Nama Pemesan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaPemesan}
                  onChange={(e) => setNamaPemesan(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-xs">
                  Nomor HP / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nomorTeleponPemesan}
                  onChange={(e) => setNomorTeleponPemesan(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>

              {/* Email with Quick Domain Shortcuts */}
              <div>
                <label className="block text-slate-600 mb-1 text-xs flex items-center justify-between">
                  <span>Email Pemesan</span>
                  <span className="text-[10px] text-teal-700 font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Pintasan:
                  </span>
                </label>
                <input
                  type="email"
                  value={emailPemesan}
                  onChange={(e) => setEmailPemesan(e.target.value)}
                  placeholder="budi@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
                {/* Domain Quick Buttons */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  {["@gmail.com", "@yahoo.com", "@icloud.com"].map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => handleApplyEmailDomain(dom)}
                      className="text-[10px] px-2 py-0.5 bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-300 hover:border-teal-300 rounded-md font-mono transition-colors shadow-2xs"
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-xs">
                  Alamat Asal Pemesan
                </label>
                <input
                  type="text"
                  value={alamatPemesan}
                  onChange={(e) => setAlamatPemesan(e.target.value)}
                  placeholder="Bandung, Jawa Barat"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Detail Layanan & Perhitungan Harga */}
          <div className="space-y-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>Layanan Utama & Model Perhitungan</span>
              </h3>

              {/* Toggle: Hitung per Satuan vs Tanpa Satuan (-) */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-300 text-xs">
                <button
                  type="button"
                  onClick={() => setTipeHitungan("satuan")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${tipeHitungan === "satuan"
                      ? "bg-teal-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Hitung per Pax / Satuan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipeHitungan("non-satuan");
                    if (fixedTotal === 0 && qty * hargaSatuan > 0) {
                      setFixedTotal(qty * hargaSatuan);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${tipeHitungan === "non-satuan"
                      ? "bg-teal-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Tanpa Satuan / Borongan (-)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1 text-xs">
                  Nama Paket Layanan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={paketLayanan}
                  onChange={(e) => setPaketLayanan(e.target.value)}
                  placeholder="Contoh: Paket Body Rafting Green Canyon / Sewa Bus Pariwisata"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-xs">
                  Tanggal Pelaksanaan Trip
                </label>
                <input
                  type="date"
                  value={tanggalPelaksanaan}
                  onChange={(e) => setTanggalPelaksanaan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>
            </div>

            {/* Input Perhitungan: Satuan vs Non-Satuan */}
            {tipeHitungan === "satuan" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Jumlah Peserta (Pax / Qty)
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      required
                      value={qty === 0 ? "" : qty}
                      placeholder="1"
                      onChange={(e) => setQty(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-teal-600 text-xs font-bold text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setQty(qty + 1)}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Harga Satuan per Pax (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={hargaSatuan === 0 ? "" : hargaSatuan}
                    onChange={(e) => setHargaSatuan(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-teal-600 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Subtotal Paket
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>{formatRupiah(mainPackageTotal)}</span>
                    <span className="text-[10px] text-teal-700 font-normal">({qty} Pax)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-teal-50/60 p-3.5 rounded-xl border border-teal-200">
                <div>
                  <label className="block text-slate-600 mb-1 text-xs">
                    Satuan / Qty (Pax)
                  </label>
                  <div className="w-full px-3 py-2 bg-white/70 border border-slate-300 rounded-lg text-slate-400 font-bold text-xs text-center">
                    - (Tanpa Satuan)
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 text-xs">
                    Harga Satuan
                  </label>
                  <div className="w-full px-3 py-2 bg-white/70 border border-slate-300 rounded-lg text-slate-400 font-bold text-xs text-center">
                    -
                  </div>
                </div>

                <div>
                  <label className="block text-teal-900 font-bold mb-1 text-xs">
                    Total Harga Paket / Borongan (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={fixedTotal === 0 ? "" : fixedTotal}
                    onChange={(e) => setFixedTotal(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg focus:outline-teal-600 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 mb-1 text-xs">
                  Deskripsi Layanan / Fasilitas
                </label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Fasilitas yang didapatkan wisatawan..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 text-xs">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan penjemputan, meeting point, atau instruksi rombongan..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Layanan Tambahan (Add-ons) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Layanan Tambahan (Add-ons)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Item fasilitas atau sewa tambahan jika ada
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddService(true)}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold px-2.5 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Satuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddService(false)}
                  className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tanpa Satuan (-)</span>
                </button>
              </div>
            </div>

            {layananTambahan.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                Belum ada layanan tambahan. Klik tombol di atas jika ada tambahan (misal: Drone, BBQ, Homestay).
              </div>
            ) : (
              <div className="space-y-2">
                {layananTambahan.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <input
                      type="text"
                      placeholder="Nama Layanan Tambahan (e.g. Sewa Drone / Perahu)"
                      value={addon.nama}
                      onChange={(e) => handleUpdateService(addon.id, "nama", e.target.value)}
                      className="w-full sm:flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {addon.pakaiSatuan === false ? (
                        <>
                          <div className="w-16 px-2 py-1.5 bg-slate-200/70 border border-slate-300 rounded-md text-xs font-bold text-center text-slate-500">
                            -
                          </div>
                          <div className="w-24 px-2 py-1.5 bg-slate-200/70 border border-slate-300 rounded-md text-xs font-bold text-center text-slate-500">
                            -
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            step="any"
                            value={addon.total === 0 ? "" : addon.total}
                            onChange={(e) => handleUpdateService(addon.id, "total", e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-28 px-2 py-1.5 bg-white border border-teal-300 rounded-md text-xs font-mono font-bold"
                          />
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={addon.qty === 0 ? "" : addon.qty}
                            onChange={(e) => handleUpdateService(addon.id, "qty", e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-bold text-center"
                          />
                          <input
                            type="number"
                            placeholder="0"
                            step="any"
                            min="0"
                            value={addon.harga === 0 ? "" : addon.harga}
                            onChange={(e) => handleUpdateService(addon.id, "harga", e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-24 px-2 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-bold"
                          />
                          <div className="w-28 text-right font-mono font-bold text-xs text-slate-800">
                            {formatRupiah(addon.total)}
                          </div>
                        </>
                      )}

                      {/* Toggle Satuan vs Non-Satuan */}
                      <button
                        type="button"
                        onClick={() => handleUpdateService(addon.id, "pakaiSatuan", addon.pakaiSatuan === false ? true : false)}
                        title={addon.pakaiSatuan === false ? "Ganti ke mode per satuan" : "Ganti ke mode tanpa satuan (-)"}
                        className="px-1.5 py-1 text-[10px] rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 font-mono"
                      >
                        {addon.pakaiSatuan === false ? "Non-Satuan (-)" : "Satuan"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveService(addon.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Bagian Finansial (Grand Total, Uang Masuk, Laba Bersih) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl space-y-4 shadow-md">
            <h3 className="font-bold text-xs uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Kalkulasi Finansial & Pembayaran</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Grand Total */}
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                <span className="text-xs text-slate-300 block mb-1">
                  Grand Total Nilai Tagihan
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-teal-300">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              {/* Sisa Tagihan */}
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                <span className="text-xs text-amber-200 block mb-1">
                  Sisa Tagihan (Pelunasan)
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                  {formatRupiah(sisaTagihan)}
                </span>
              </div>
            </div>

            {/* Quick Click Payment Options (DP & Pelunasan) */}
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Klik Cepat Status Bayar (DP / Pelunasan):</span>
                </span>
                <span className="text-[11px] text-slate-300">
                  Status sekarang: <strong className="text-white">{status}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {/* Belum Bayar */}
                <button
                  type="button"
                  onClick={() => handleQuickSetPayment(0, "Belum Bayar")}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${totalUangMasuk === 0
                      ? "bg-amber-500/30 text-amber-300 border-amber-400/50 font-bold ring-1 ring-amber-400/30"
                      : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
                    }`}
                >
                  Belum Bayar (Rp 0)
                </button>

                {/* DP 20% */}
                <button
                  type="button"
                  onClick={() => handleQuickSetPayment(Math.round(grandTotal * 0.2), "DP (Down Payment)")}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${totalUangMasuk === Math.round(grandTotal * 0.2) && grandTotal > 0
                      ? "bg-sky-500/40 text-sky-300 border-sky-400/60 font-bold ring-1 ring-sky-400/40"
                      : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
                    }`}
                >
                  DP 20% ({formatRupiah(Math.round(grandTotal * 0.2))})
                </button>

                {/* DP 30% */}
                <button
                  type="button"
                  onClick={() => handleQuickSetPayment(Math.round(grandTotal * 0.3), "DP (Down Payment)")}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${totalUangMasuk === Math.round(grandTotal * 0.3) && grandTotal > 0
                      ? "bg-sky-500/40 text-sky-300 border-sky-400/60 font-bold ring-1 ring-sky-400/40"
                      : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
                    }`}
                >
                  DP 30% ({formatRupiah(Math.round(grandTotal * 0.3))})
                </button>

                {/* DP 50% */}
                <button
                  type="button"
                  onClick={() => handleQuickSetPayment(Math.round(grandTotal * 0.5), "DP (Down Payment)")}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${totalUangMasuk === Math.round(grandTotal * 0.5) && grandTotal > 0
                      ? "bg-sky-500/40 text-sky-300 border-sky-400/60 font-bold ring-1 ring-sky-400/40"
                      : "bg-white/10 text-slate-300 border-white/10 hover:bg-white/20"
                    }`}
                >
                  DP 50% ({formatRupiah(Math.round(grandTotal * 0.5))})
                </button>

                {/* Lunas 100% */}
                <button
                  type="button"
                  onClick={() => handleQuickSetPayment(grandTotal, "Lunas")}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${totalUangMasuk === grandTotal && grandTotal > 0
                      ? "bg-emerald-500/40 text-emerald-200 border-emerald-400/70 ring-2 ring-emerald-500/50"
                      : "bg-emerald-600/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/50"
                    }`}
                >
                  ✓ Lunas 100% ({formatRupiah(grandTotal)})
                </button>
              </div>

              {/* Pelunasan Sisa Tagihan Button (if DP was already paid) */}
              {sisaTagihan > 0 && totalUangMasuk > 0 && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-amber-300">
                    Tamu ingin melakukan pelunasan sisa {formatRupiah(sisaTagihan)}?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickSetPayment(grandTotal, "Lunas")}
                    className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold transition-all shadow-md shadow-emerald-950/40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lunaskan Sekarang</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Total Uang Masuk */}
              <div>
                <label className="block text-emerald-300 font-semibold mb-1 text-xs flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Total Uang Masuk Diterima (Rp)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={totalUangMasuk === 0 ? "" : totalUangMasuk}
                  onChange={(e) => handleUangMasukChange(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:outline-teal-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Bisa diketik manual atau gunakan tombol pilihan cepat di atas
                </span>
              </div>

              {/* Laba Bersih */}
              <div>
                <label className="block text-sky-300 font-semibold mb-1 text-xs flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Estimasi Laba Bersih (Rp)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={labaBersih === 0 ? "" : labaBersih}
                  onChange={(e) => setLabaBersih(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:outline-teal-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Keuntungan bersih usaha PangandaranHub dari invoice ini
                </span>
              </div>
            </div>
          </div>

          {/* Buttons Footer (Full-width on mobile) */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 rounded-lg shadow-sm shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-center cursor-pointer"
            >
              {initialInvoice ? "Simpan Perubahan Faktur" : "Terbitkan Invoice"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
