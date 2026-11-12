"use client";

import React, { useState } from "react";
import { Booking, Participant } from "@/types";
import { formatDateIndo } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import SmartPasteBox from "./SmartPasteBox";
import { ParsedBookingData } from "@/lib/textParser";
import { 
  Users, 
  Plus, 
  Calendar, 
  Car, 
  Clock, 
  Phone, 
  Receipt, 
  Trash2, 
  Edit3, 
  X, 
  UserCheck, 
  Search,
  MapPin
} from "lucide-react";

interface BookingManagerProps {
  bookings: Booking[];
  onSaveBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
  onConvertToInvoice: (booking: Booking) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}

export default function BookingManager({
  bookings,
  onSaveBooking,
  onDeleteBooking,
  onConvertToInvoice,
  isCreateOpen,
  setIsCreateOpen,
}: BookingManagerProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form State
  const [bookingCode, setBookingCode] = useState("");
  const [namaPemesan, setNamaPemesan] = useState("");
  const [nomorHp, setNomorHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [nomorKendaraan, setNomorKendaraan] = useState("");
  const [pilihanPaket, setPilihanPaket] = useState("Paket Body Rafting Green Canyon Full Track");
  const [tanggalTrip, setTanggalTrip] = useState("");
  const [estimasiWaktuKedatangan, setEstimasiWaktuKedatangan] = useState("08:30 WIB");
  const [status, setStatus] = useState<Booking["status"]>("Terkonfirmasi");
  const [peserta, setPeserta] = useState<Participant[]>([
    { id: "p-1", nama: "", gender: "Laki-laki" },
  ]);

  const openNewBookingModal = () => {
    const today = new Date();
    const ym = today.toISOString().slice(0, 7).replace("-", "");
    const rand = Math.floor(100 + Math.random() * 900);
    setBookingCode(`BKG-${ym}-${rand}`);
    setNamaPemesan("");
    setNomorHp("");
    setAlamat("");
    setInstagram("");
    setEmail("");
    setNomorKendaraan("");
    setPilihanPaket("Paket Body Rafting Green Canyon Full Track");
    setTanggalTrip(new Date().toISOString().split("T")[0]);
    setEstimasiWaktuKedatangan("08:30 WIB");
    setStatus("Terkonfirmasi");
    setPeserta([{ id: `p-${Date.now()}`, nama: "", gender: "Laki-laki" }]);
    setEditingBooking(null);
    setIsCreateOpen(true);
  };

  const openEditBookingModal = (b: Booking) => {
    setEditingBooking(b);
    setBookingCode(b.bookingCode);
    setNamaPemesan(b.namaPemesan);
    setNomorHp(b.nomorHp);
    setAlamat(b.alamat || "");
    setInstagram(b.instagram || "");
    setEmail(b.email || "");
    setNomorKendaraan(b.nomorKendaraan || "");
    setPilihanPaket(b.pilihanPaket);
    setTanggalTrip(b.tanggalTrip);
    setEstimasiWaktuKedatangan(b.estimasiWaktuKedatangan || "08:30 WIB");
    setStatus(b.status);
    setPeserta(b.peserta && b.peserta.length > 0 ? b.peserta : [{ id: `p-${Date.now()}`, nama: "", gender: "Laki-laki" }]);
    setIsCreateOpen(true);
  };

  const handleAddParticipant = () => {
    setPeserta([
      ...peserta,
      { id: `p-${Date.now()}`, nama: "", gender: "Laki-laki" },
    ]);
  };

  const handleUpdateParticipant = (id: string, field: "nama" | "gender", val: string) => {
    setPeserta(
      peserta.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleRemoveParticipant = (id: string) => {
    if (peserta.length <= 1) return;
    setPeserta(peserta.filter((p) => p.id !== id));
  };

  const handleApplySmartPaste = (parsed: ParsedBookingData) => {
    if (parsed.namaPemesan) setNamaPemesan(parsed.namaPemesan);
    if (parsed.nomorHp) setNomorHp(parsed.nomorHp);
    if (parsed.alamat) setAlamat(parsed.alamat);
    if (parsed.instagram) setInstagram(parsed.instagram);
    if (parsed.email) setEmail(parsed.email);
    if (parsed.nomorKendaraan) setNomorKendaraan(parsed.nomorKendaraan);
    if (parsed.pilihanPaket) setPilihanPaket(parsed.pilihanPaket);
    if (parsed.tanggalTrip) setTanggalTrip(parsed.tanggalTrip);
    if (parsed.estimasiWaktuKedatangan) setEstimasiWaktuKedatangan(parsed.estimasiWaktuKedatangan);
    if (parsed.peserta && parsed.peserta.length > 0) setPeserta(parsed.peserta);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPemesan.trim()) return;

    // Filter empty participant names or auto-fill primary booker
    const cleanedPeserta = peserta
      .map((p, idx) => ({
        ...p,
        nama: p.nama.trim() ? p.nama.trim() : idx === 0 ? namaPemesan.trim() : `Peserta ${idx + 1}`,
      }));

    const saved: Booking = {
      id: editingBooking ? editingBooking.id : `bkg-${Date.now()}`,
      bookingCode,
      namaPemesan: namaPemesan.trim(),
      nomorHp: nomorHp.trim(),
      alamat: alamat.trim(),
      instagram: instagram.trim(),
      email: email.trim(),
      nomorKendaraan: nomorKendaraan.trim(),
      pilihanPaket,
      tanggalTrip,
      estimasiWaktuKedatangan: estimasiWaktuKedatangan.trim(),
      peserta: cleanedPeserta,
      status,
      createdAt: editingBooking ? editingBooking.createdAt : new Date().toISOString(),
      userEmail: editingBooking?.userEmail || user?.email || undefined,
      userId: editingBooking?.userId || user?.uid || undefined,
    };

    onSaveBooking(saved);
    setIsCreateOpen(false);
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

  const filteredBookings = bookings.filter((b) => {

    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      b.bookingCode.toLowerCase().includes(q) ||
      b.namaPemesan.toLowerCase().includes(q) ||
      b.pilihanPaket.toLowerCase().includes(q) ||
      b.nomorHp.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Manajemen Tamu & Rombongan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Data Booking Wisata
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Catat pemesanan tamu, data kendaraan, dan manifest peserta rombongan. Siap dijadikan faktur langsung.
          </p>
        </div>

        <button
          onClick={openNewBookingModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Booking Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode booking, nama pemesan, paket, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-teal-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Booking Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBookings.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              Belum ada data booking yang sesuai.
            </p>
            <button
              onClick={openNewBookingModal}
              className="mt-3 px-4 py-2 text-xs font-semibold bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100"
            >
              + Buat Booking Pertama
            </button>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {b.bookingCode}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === "Terkonfirmasi"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : b.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="mt-3.5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {b.namaPemesan}
                  </h3>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.nomorHp}</span>
                    </div>
                    {b.instagram && (
                      <div className="flex items-center gap-1.5 text-pink-600">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span>{b.instagram}</span>
                      </div>
                    )}
                    {b.alamat && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{b.alamat}</span>
                      </div>
                    )}
                  </div>

                  {/* Trip & Vehicle Badge */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {b.pilihanPaket}
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDateIndo(b.tanggalTrip)}
                      </span>
                      <span className="flex items-center gap-1 text-teal-700 font-medium">
                        <Clock className="w-3 h-3" />
                        Tiba {b.estimasiWaktuKedatangan}
                      </span>
                    </div>
                    {b.nomorKendaraan && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 font-mono">
                        <Car className="w-3 h-3 text-slate-400" />
                        <span>Kendaraan: {b.nomorKendaraan}</span>
                      </div>
                    )}
                  </div>

                  {/* Participants summary */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">
                        Manifest Peserta ({b.peserta ? b.peserta.length : 0} Orang)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {b.peserta && b.peserta.map((p, idx) => (
                        <span
                          key={p.id || idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                        >
                          <UserCheck className="w-2.5 h-2.5 text-teal-600" />
                          <span>{p.nama}</span>
                          <span className="text-slate-400 font-mono">({p.gender === "Laki-laki" ? "L" : "P"})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onConvertToInvoice(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Jadikan Invoice</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditBookingModal(b)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Data Booking"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteBooking(b.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Input/Edit Booking */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h2 className="text-sm sm:text-lg font-bold">
                  {editingBooking ? "Edit Data Booking Tamu" : "Input Booking Wisata Baru"}
                </h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={handleSubmit} 
              onKeyDown={handleFormKeyDown}
              className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs sm:text-sm"
            >
              {/* Smart Paste WhatsApp Box */}
              <SmartPasteBox
                onApply={handleApplySmartPaste}
                title="Smart Paste dari Chat WhatsApp"
                description="Salin pesan format booking dari WhatsApp, tempel di sini untuk otomatis mengisi form booking tamu."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Kode Booking
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Status Booking
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Booking["status"])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="Terkonfirmasi">Terkonfirmasi</option>
                    <option value="Pending">Pending</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Nama Pemesan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaPemesan}
                    onChange={(e) => setNamaPemesan(e.target.value)}
                    placeholder="Nama Lengkap Pemesan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Nomor HP / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs flex items-center justify-between">
                    <span>Email Pemesan</span>
                    <span className="text-[10px] text-teal-700 font-medium">Pintasan:</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <div className="flex items-center gap-1 mt-1">
                    {["@gmail.com", "@yahoo.com", "@icloud.com"].map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => {
                          if (!email.trim()) {
                            const safe = namaPemesan ? namaPemesan.toLowerCase().replace(/[^a-z0-9]/g, "") : "tamu";
                            setEmail(`${safe}${dom}`);
                          } else {
                            const p = email.split("@")[0].trim();
                            setEmail(`${p}${dom}`);
                          }
                        }}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-300 rounded font-mono transition-colors"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Instagram (@username)
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Alamat Asal Pemesan
                  </label>
                  <input
                    type="text"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Kota Asal / Alamat Tamu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Trip & Vehicle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Pilihan Paket Wisata
                  </label>
                  <input
                    type="text"
                    value={pilihanPaket}
                    onChange={(e) => setPilihanPaket(e.target.value)}
                    placeholder="Paket Body Rafting Green Canyon"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Tanggal Trip
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalTrip}
                    onChange={(e) => setTanggalTrip(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Estimasi Waktu Kedatangan
                  </label>
                  <input
                    type="text"
                    value={estimasiWaktuKedatangan}
                    onChange={(e) => setEstimasiWaktuKedatangan(e.target.value)}
                    placeholder="08:30 WIB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Nomor Kendaraan & Tipe (Plat Nomor)
                  </label>
                  <input
                    type="text"
                    value={nomorKendaraan}
                    onChange={(e) => setNomorKendaraan(e.target.value)}
                    placeholder="Contoh: D 1234 ABC (Bus Pariwisata / Avanza Hitam)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Peserta Section */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold text-xs uppercase tracking-wider">
                    Daftar Nama Peserta & Gender ({peserta.length} Orang)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Peserta</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {peserta.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-6 text-center">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Nama Lengkap Peserta"
                        value={p.nama}
                        onChange={(e) => handleUpdateParticipant(p.id, "nama", e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                      <select
                        value={p.gender}
                        onChange={(e) => handleUpdateParticipant(p.id, "gender", e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      {peserta.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons (Full-width on mobile) */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 rounded-lg shadow-sm shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-center cursor-pointer"
                >
                  {editingBooking ? "Simpan Perubahan Booking" : "Simpan Booking Baru"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
