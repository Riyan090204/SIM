"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FinancialDashboard from "@/components/FinancialDashboard";
import InvoiceList from "@/components/InvoiceList";
import BookingManager from "@/components/BookingManager";
import InvoiceModal from "@/components/InvoiceModal";
import InvoicePrintView from "@/components/InvoicePrintView";
import LoginView from "@/components/LoginView";
import { useAuth } from "@/context/AuthContext";
import { Invoice, Booking } from "@/types";
import { getAccountProfile } from "@/lib/accountConfig";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeBookings,
  subscribeInvoices,
  saveBookingToFirestore,
  deleteBookingFromFirestore,
  saveInvoiceToFirestore,
  deleteInvoiceFromFirestore,
  syncLocalDataToFirestore,
} from "@/lib/firebaseService";
import { Compass, Cloud, Database, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "invoices" | "bookings">("dashboard");

  // State for Invoices & Bookings
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Unsynced local data count (if any exists from before Firebase was configured)
  const [localDataCount, setLocalDataCount] = useState<{ bookings: number; invoices: number }>({
    bookings: 0,
    invoices: 0,
  });

  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // 1. Initial Load & Realtime Subscriptions (hanya aktif jika user sudah login)
  useEffect(() => {
    if (!user) {
      const resetTimer = setTimeout(() => {
        setInvoices([]);
        setBookings([]);
        setIsLoaded(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    let unsubBookings = () => { };
    let unsubInvoices = () => { };

    // Safety timeout: Jangan biarkan halaman macet di "Memuat data..." lebih dari 1.5 detik
    const safetyTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    // Muat data lokal secara aman
    const localTimer = setTimeout(() => {
      let localB: Booking[] = [];
      let localI: Invoice[] = [];
      try {
        const uKey = user?.email ? `_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}` : "";
        const storedBookings = localStorage.getItem(`pangandaranhub_bookings${uKey}`) || localStorage.getItem("pangandaranhub_bookings");
        const storedInvoices = localStorage.getItem(`pangandaranhub_invoices${uKey}`) || localStorage.getItem("pangandaranhub_invoices");
        const dummyIds = ["inv-1", "inv-2", "inv-3", "bkg-1", "bkg-2", "bkg-3"];

        if (storedBookings) {
          localB = JSON.parse(storedBookings).filter((b: Booking) => !dummyIds.includes(b.id));
        }
        if (storedInvoices) {
          localI = JSON.parse(storedInvoices).filter((i: Invoice) => !dummyIds.includes(i.id));
        }
        setLocalDataCount({ bookings: localB.length, invoices: localI.length });
        if (localB.length > 0) setBookings(localB);
        if (localI.length > 0) setInvoices(localI);
        setIsLoaded(true);
      } catch (e) {
        console.error("Gagal memeriksa localStorage:", e);
      }
    }, 0);

    if (isFirebaseConfigured) {
      // MODE FIREBASE: Aktifkan Realtime Listener
      unsubBookings = subscribeBookings(
        (data) => {
          if (data && data.length > 0) {
            setBookings(data);
          }
          setIsLoaded(true);
          setFirestoreError(null);
        },
        (err) => {
          console.error("Firebase bookings error:", err);
          setIsLoaded(true);
          setFirestoreError(err.message || "Gagal memuat data dari Firestore");
        },
        user.email
      );

      unsubInvoices = subscribeInvoices(
        (data) => {
          if (data && data.length > 0) {
            setInvoices(data);
          }
          setIsLoaded(true);
          setFirestoreError(null);
        },
        (err) => {
          console.error("Firebase invoices error:", err);
          setIsLoaded(true);
          setFirestoreError(err.message || "Gagal memuat data dari Firestore");
        },
        user.email
      );
    }

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(localTimer);
      unsubBookings();
      unsubInvoices();
    };
  }, [user]);

  // Sync to localStorage as backup
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const uKey = user?.email ? `_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}` : "";
      localStorage.setItem(`pangandaranhub_invoices${uKey}`, JSON.stringify(invoices));
      localStorage.setItem("pangandaranhub_invoices", JSON.stringify(invoices));
    } catch (e) {
      console.error("Gagal menyimpan invoices ke localStorage:", e);
    }
  }, [invoices, isLoaded, user]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const uKey = user?.email ? `_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}` : "";
      localStorage.setItem(`pangandaranhub_bookings${uKey}`, JSON.stringify(bookings));
      localStorage.setItem("pangandaranhub_bookings", JSON.stringify(bookings));
    } catch (e) {
      console.error("Gagal menyimpan bookings ke localStorage:", e);
    }
  }, [bookings, isLoaded, user]);

  // Handler: Migrate Local Data to Firebase
  const handleMigrateToCloud = async () => {
    if (!isFirebaseConfigured) return;
    setIsSyncing(true);
    try {
      const storedBookings = localStorage.getItem("pangandaranhub_bookings");
      const storedInvoices = localStorage.getItem("pangandaranhub_invoices");
      const bList: Booking[] = storedBookings ? JSON.parse(storedBookings) : [];
      const iList: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : [];

      const res = await syncLocalDataToFirestore(bList, iList);
      setSyncMessage(
        `Berhasil menyinkronkan ${res.bookingsCount} booking & ${res.invoicesCount} invoice ke Cloud!`
      );
      setLocalDataCount({ bookings: 0, invoices: 0 });
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err) {
      console.error("Gagal migrasi data:", err);
      alert("Gagal menyinkronkan data ke Firebase. Periksa Security Rules Firestore Anda.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Invoice Handlers
  const handleSaveInvoice = async (saved: Invoice) => {
    // 1. Simpan langsung ke state lokal agar tidak hilang seketika
    setInvoices((prev) => {
      const exists = prev.some((inv) => inv.id === saved.id);
      return exists ? prev.map((inv) => (inv.id === saved.id ? saved : inv)) : [saved, ...prev];
    });

    // 2. Simpan ke Cloud Firestore jika terhubung
    if (isFirebaseConfigured) {
      try {
        await saveInvoiceToFirestore(saved, user?.email, user?.uid);
      } catch (err) {
        console.error("Gagal simpan invoice ke Firestore:", err);
        alert("Peringatan: Gagal tersambung ke Cloud Firestore. Data tetap disimpan di browser ini. Pastikan tab Rules di Firebase Console sudah di-publish!");
      }
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus invoice ini?")) return;

    if (isFirebaseConfigured) {
      try {
        await deleteInvoiceFromFirestore(id);
        if (viewingInvoice?.id === id) setViewingInvoice(null);
      } catch (err) {
        console.error("Gagal hapus invoice dari Firestore:", err);
        alert("Gagal menghapus dari Firestore.");
      }
    } else {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      if (viewingInvoice?.id === id) setViewingInvoice(null);
    }
  };

  const handleOpenCreateInvoice = () => {
    setEditingInvoice(null);
    setSelectedBookingForInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setSelectedBookingForInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setViewingInvoice(inv);
  };

  // Booking Handlers
  const handleSaveBooking = async (saved: Booking) => {
    // 1. Simpan langsung ke state lokal agar tidak hilang seketika
    setBookings((prev) => {
      const exists = prev.some((b) => b.id === saved.id);
      return exists ? prev.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...prev];
    });

    // 2. Simpan ke Cloud Firestore jika terhubung
    if (isFirebaseConfigured) {
      try {
        await saveBookingToFirestore(saved, user?.email, user?.uid);
      } catch (err) {
        console.error("Gagal simpan booking ke Firestore:", err);
        alert("Peringatan: Gagal tersambung ke Cloud Firestore. Data tetap disimpan di browser ini. Pastikan tab Rules di Firebase Console sudah di-publish!");
      }
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Hapus data booking ini?")) return;

    if (isFirebaseConfigured) {
      try {
        await deleteBookingFromFirestore(id);
      } catch (err) {
        console.error("Gagal hapus booking dari Firestore:", err);
        alert("Gagal menghapus booking dari Firestore.");
      }
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleConvertToInvoice = (b: Booking) => {
    setSelectedBookingForInvoice(b);
    setEditingInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  // Guard 1: Sedang memverifikasi sesi login Firebase
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-teal-500/20 animate-pulse">
            <Compass className="w-9 h-9" />
          </div>
          <div className="flex items-center gap-2.5 text-slate-300 text-sm font-medium">
            <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
            <span>Memverifikasi akun tim PangandaranHub...</span>
          </div>
        </div>
      </div>
    );
  }

  // Guard 2: Kunci penuh — wajib login sebelum bisa melihat atau membuat invoice/booking
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateInvoice={handleOpenCreateInvoice}
        onOpenCreateBooking={() => setIsBookingModalOpen(true)}
      />

      {/* Backend Status Bar */}
      <div className="no-print bg-slate-100 border-b border-slate-200/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Cloud Firestore (Realtime Aktif)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                Mode Penyimpanan Lokal (Isi .env.local untuk Cloud Firestore)
              </span>
            )}

            {syncMessage && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {syncMessage}
              </span>
            )}
          </div>

          {/* Sync Button if there's local data to push to Firebase */}
          {isFirebaseConfigured && (localDataCount.bookings > 0 || localDataCount.invoices > 0) && (
            <button
              onClick={handleMigrateToCloud}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
              <span>
                Upload {localDataCount.bookings + localDataCount.invoices} Data Lokal ke Cloud
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Firestore Error Alert (if permission or connection issue) */}
      {firestoreError && (
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <span className="font-semibold">Catatan Koneksi Cloud:</span> {firestoreError}.{" "}
              <span className="text-amber-700">
                (Jika pesan <em>Missing or insufficient permissions</em>, buka Firebase Console &gt; Firestore Database &gt; Rules, lalu pastikan diatur ke Test Mode: <code>allow read, write: if true;</code>).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area (Hidden during Print) */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 sm:py-8">

        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm font-medium">Memuat data...</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <FinancialDashboard
                invoices={invoices}
                onViewInvoice={handleViewInvoice}
                onOpenCreateInvoice={handleOpenCreateInvoice}
              />
            )}

            {activeTab === "invoices" && (
              <InvoiceList
                invoices={invoices}
                onViewInvoice={handleViewInvoice}
                onEditInvoice={handleEditInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onOpenCreateInvoice={handleOpenCreateInvoice}
              />
            )}

            {activeTab === "bookings" && (
              <BookingManager
                bookings={bookings}
                onSaveBooking={handleSaveBooking}
                onDeleteBooking={handleDeleteBooking}
                onConvertToInvoice={handleConvertToInvoice}
                isCreateOpen={isBookingModalOpen}
                setIsCreateOpen={setIsBookingModalOpen}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {(() => {
            const profile = getAccountProfile(user?.email);
            return (
              <>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-slate-800">
                    {profile.name}
                  </span>
                  <span>— Sistem Invoice & Manajemen Finansial Wisata</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>Rekening Resmi {profile.bankName}: {profile.bankAccountNumber} a.n {profile.bankAccountName}</span>
                </div>
              </>
            );
          })()}
        </div>
      </footer>

      {/* Invoice Create / Edit Modal */}
      {isInvoiceModalOpen && (
        <InvoiceModal
          key={editingInvoice?.id || selectedBookingForInvoice?.id || "new-invoice"}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          onSave={handleSaveInvoice}
          initialInvoice={editingInvoice}
          bookings={bookings}
          selectedBookingForInvoice={selectedBookingForInvoice}
        />
      )}

      {/* Invoice Printable View Modal */}
      {viewingInvoice && (
        <InvoicePrintView
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onEdit={(inv) => {
            setViewingInvoice(null);
            handleEditInvoice(inv);
          }}
        />
      )}
    </div>
  );
}
